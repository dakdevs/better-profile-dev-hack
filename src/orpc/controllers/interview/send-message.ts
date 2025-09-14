import { streamToEventIterator } from '@orpc/server'
import { convertToModelMessages, validateUIMessages, type UIMessage } from 'ai'
import { after } from 'next/server'
import { Agent } from '@mastra/core'
import z from 'zod'

import { mastra } from '~/ai/mastra'
import { protectedBase } from '~/orpc/middleware/bases'
import { InterviewRAGAgent } from '~/services/rag-agent'
import { InterviewGradingService } from '~/services/interview-grading'
import { UserSkillsService } from '~/services/user-skills'
import { ConversationStateService } from '~/services/conversation-state'

// Instantiate services
const ragAgent = new InterviewRAGAgent()
const gradingService = new InterviewGradingService()
const userSkillsService = new UserSkillsService()
const conversationStateService = new ConversationStateService()

export default protectedBase
	.input(
		z.object({
			chatId: z.string().optional(),
			message: z.custom<UIMessage>().refine(async (data) => {
				try {
					await validateUIMessages({ messages: [data] })
				} catch {
					return false
				}
				return true
			}, 'Invalid message'),
		}),
	)
	.handler(async function ({ input, context }) {
		const userId = context.auth.user.id
		// Extract message content from parts array
		const userMessageContent = input.message.parts?.find((part) => part.type === 'text')?.text || ''

		// Generate session ID if not provided
		const sessionId = input.chatId || `session-${Date.now()}`

		// Get or create interview session
		const session = await conversationStateService.getOrCreateSession(userId, sessionId)

		// Initialize or get conversation state
		let state = conversationStateService.getConversationState(sessionId)
		if (!state) {
			state = conversationStateService.initializeConversationState(sessionId)
		}

		// --- RAG Agent Integration ---
		// 1. Process the user's query with the RAG agent first
		console.log('🤖 RAG Agent: Processing user query...')
		const ragResponse = await ragAgent.processQuery(userMessageContent, userId)

		// 2. If the RAG agent blocks the query, return its response directly
		if (!ragResponse.isRelevant && ragResponse.response) {
			console.log('🚫 RAG Agent blocked off-topic query.')
			// Return early response for off-topic queries
			return streamToEventIterator(
				(async function* () {
					yield { type: 'text-delta', textDelta: ragResponse.response }
				})()
			)
		}

		// 3. Use the enhanced prompt from the RAG agent for the main AI
		const promptForMastra = ragResponse.enhancedPrompt || userMessageContent
		console.log('✅ RAG Agent: Enhanced prompt ready for main LLM')
		console.log('📝 Enhanced prompt length:', promptForMastra.length)
		console.log('🎯 Context included:', ragResponse.enhancedPrompt ? 'Yes' : 'No')

		// --- Original Mastra Agent Call ---
		const agent = mastra.getAgent('careerInterviewerAgent')

		// Get topic tree state for dynamic prompt
		const topicTreeState = conversationStateService.getTopicTreeState(sessionId)
		const currentPath = conversationStateService.getCurrentPath(sessionId)
		const exhaustedTopics = conversationStateService.getExhaustedTopics(sessionId)

		// Create dynamic system prompt with current state
		const dynamicInstructions = agent.instructions
			.replace('{topicTreeState}', topicTreeState)
			.replace('{currentPath}', currentPath)
			.replace('{exhaustedTopics}', exhaustedTopics)

		// Create a new agent instance with dynamic instructions
		const dynamicAgent = new Agent({
			name: agent.name,
			instructions: dynamicInstructions,
			model: agent.model,
		})

		// Modify the user message content with our new enhanced prompt
		const modifiedUIMessage: UIMessage = {
			...input.message,
			parts: [{ type: 'text', text: promptForMastra }],
		}

		const stream = await dynamicAgent.streamVNext(convertToModelMessages([modifiedUIMessage]))

		// Background processing for grading (non-blocking)
		after(async () => {
			if (!userMessageContent) return

			console.log(`🔄 Starting adaptive analysis for session ${sessionId}...`)

			try {
				// Analyze user response
				const analysis = await gradingService.analyzeResponse(userMessageContent)

				// Grade the response
				const score = await gradingService.gradeResponse(userMessageContent, analysis)

				// Enhanced grading display
				const scoreEmoji = score >= 1.8 ? '🌟' : score >= 1.5 ? '🎯' : score >= 1.0 ? '👍' : '📝'
				const performance = score >= 1.8 ? 'EXCELLENT' : score >= 1.5 ? 'STRONG' : score >= 1.0 ? 'GOOD' : 'NEEDS WORK'

				console.log('\n' + '='.repeat(60))
				console.log(`${scoreEmoji} ADAPTIVE INTERVIEW GRADE - Session ${sessionId}`)
				console.log('='.repeat(60))
				console.log(`📊 SCORE: ${score.toFixed(2)}/2.0 (${performance})`)
				console.log(`🎯 ENGAGEMENT: ${analysis.engagementLevel.toUpperCase()}`)
				console.log(`📏 LENGTH: ${analysis.responseLength.toUpperCase()}`)
				console.log(`🎪 CONFIDENCE: ${analysis.confidenceLevel.toUpperCase()}`)
				console.log(`💬 RESPONSE: "${userMessageContent.substring(0, 80)}${userMessageContent.length > 80 ? '...' : ''}"`)
				console.log(`🗺️ CURRENT PATH: ${conversationStateService.getCurrentPath(sessionId)}`)
				console.log(`⏰ TIMESTAMP: ${new Date().toLocaleTimeString()}`)
				console.log('='.repeat(60) + '\n')

				// Create response grade
				const grade = {
					messageIndex: state.grades.length + 1,
					score,
					timestamp: new Date().toISOString(),
					content: userMessageContent,
					engagementLevel: analysis.engagementLevel
				}

				// Update topic tree based on analysis
				conversationStateService.updateTopicTree(sessionId, analysis, userMessageContent, grade.messageIndex)

				// Update conversation state
				conversationStateService.updateConversationState(
					sessionId,
					grade,
					analysis.buzzwords,
					grade.messageIndex
				)

				// Skill extraction and persistence
				console.log('🔍 Extracting skills from user response...')
				const skills = await gradingService.extractSkillsFromText(userMessageContent)
				for (const { skill, evidence, confidence } of skills) {
					console.log(`📌 Detected skill: ${skill} (confidence: ${confidence})`)

					// Upsert user skill (creates or updates aggregated skill data)
					const userSkillId = await userSkillsService.upsertUserSkill(
						userId,
						skill,
						confidence,
						analysis.engagementLevel,
						state.totalDepth
					)

					// Create detailed skill mention record for audit trail
					await userSkillsService.createSkillMention({
						userSkillId,
						userId,
						sessionId: session.id,
						messageIndex: grade.messageIndex,
						mentionText: evidence,
						confidence,
						engagementLevel: analysis.engagementLevel,
						topicDepth: state.totalDepth,
						conversationContext: `Session: ${sessionId}`
					})
				}

				// Store conversation for RAG if relevant
				if (ragResponse.isRelevant) {
					try {
						await conversationStateService.storeConversationEmbedding(
							userMessageContent,
							userId,
							sessionId,
							grade.messageIndex
						)
						console.log('✅ Conversation stored for RAG')
					} catch (error) {
						console.log('⚠️ Failed to store conversation embedding:', error.message)
					}
				}

				// Update session metrics
				const avgScore = state.grades.reduce((sum, g) => sum + g.score, 0) / state.grades.length || 0
				await conversationStateService.updateSessionMetrics(
					sessionId,
					state.grades.length,
					analysis.engagementLevel,
					avgScore * 50, // Convert to 0-100 scale
					state.buzzwords,
					state.maxDepthReached,
					state.totalDepth
				)

				// Generate summary every 5 messages
				if (state.grades.length >= 5 && state.grades.length % 5 === 0) {
					console.log(`🎯 Generating adaptive interview summary at message ${state.grades.length}...`)
					gradingService.generateSummaryTree(sessionId, state)
				}

				console.log(`✅ Adaptive processing completed for session ${sessionId}`)

			} catch (error) {
				console.error('❌ Adaptive processing failed:', error)
			}
		})

		return streamToEventIterator(stream.aisdk.v5.toUIMessageStream())
	})
