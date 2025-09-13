// src/services/conversation-state.ts

import { db } from '~/db'
import { interviewSessions } from '~/db/models/interviews'
import { eq } from 'drizzle-orm'
import type { ConversationState, ResponseGrade, BuzzwordData } from '~/types/interview-grading'
import { TopicTreeManager } from './topic-tree-manager'

/**
 * Service for managing conversation state and session metrics
 */
export class ConversationStateService {
	// In-memory conversation states (use Redis in production)
	private conversationStates = new Map<string, ConversationState>()
	private topicTreeManager = new TopicTreeManager()

	/**
	 * Initialize conversation state for a session
	 */

	// TODO: USE AFTER
	initializeConversationState(sessionId: string): ConversationState {
		const state = this.topicTreeManager.initializeTopicTree(sessionId)
		this.conversationStates.set(sessionId, state)
		return state
	}

	/**
	 * Get conversation state for a session
	 */

	// TODO: USE AFTER
	getConversationState(sessionId: string): ConversationState | undefined {
		return this.conversationStates.get(sessionId)
	}

	/**
	 * Update conversation state with new grade and buzzwords
	 */

	// TODO: USE AFTER
	updateConversationState(
		sessionId: string, 
		grade: ResponseGrade, 
		buzzwords: string[], 
		messageIndex: number
	): void {
		const state = this.conversationStates.get(sessionId)
		if (!state) return

		// Add grade
		state.grades.push(grade)

		// Update buzzwords
		for (const raw of buzzwords) {
			const term = String(raw).trim().toLowerCase()
			if (!term) continue
			const existing = state.buzzwords.get(term) ?? { count: 0, sources: new Set<number>() }
			existing.count += 1
			existing.sources.add(messageIndex)
			state.buzzwords.set(term, existing)
		}

		console.log('🧩 Buzzwords for message', messageIndex, buzzwords)
	}

	/**
	 * Update topic tree based on response analysis
	 */

	// TODO: USE AFTER
	updateTopicTree(
		sessionId: string,
		analysis: any,
		userResponse: string,
		messageIndex: number
	): void {
		const state = this.conversationStates.get(sessionId)
		if (!state) return

		this.topicTreeManager.updateTopicTree(state, analysis, userResponse, messageIndex)
	}

	/**
	 * Get topic tree state for prompts
	 */

	// TODO: USE AFTER
	getTopicTreeState(sessionId: string): string {
		const state = this.conversationStates.get(sessionId)
		if (!state) return ''

		return this.topicTreeManager.generateTopicTreeState(state)
	}

	/**
	 * Get current topic path
	 */

	// TODO: USE AFTER
	getCurrentPath(sessionId: string): string {
		const state = this.conversationStates.get(sessionId)
		if (!state) return ''

		return this.topicTreeManager.getCurrentPath(state)
	}

	/**
	 * Get exhausted topics
	 */

	// TODO: USE AFTER
	getExhaustedTopics(sessionId: string): string {
		const state = this.conversationStates.get(sessionId)
		if (!state) return ''

		return this.topicTreeManager.getExhaustedTopics(state)
	}

	/**
	 * Update session metrics in database
	 */

	// TODO: USE AFTER
	async updateSessionMetrics(
		sessionId: string, 
		messageCount: number, 
		averageEngagement: string, 
		overallScore: number,
		buzzwords: Map<string, BuzzwordData>,
		maxDepthReached: number,
		totalDepth: number
	): Promise<void> {
		try {
			const state = this.conversationStates.get(sessionId)
			if (!state) return

			// Convert buzzwords Map to serializable format
			const buzzwordsData = Array.from(buzzwords.entries()).map(([term, data]) => ({
				term,
				count: data.count,
				sources: Array.from(data.sources)
			}))

			// Serialize topic tree state
			const topicTreeData = this.topicTreeManager.serializeTopicTreeState(state)

			await db.update(interviewSessions)
				.set({
					messageCount,
					averageEngagement,
					overallScore: overallScore.toString(),
					buzzwords: buzzwordsData,
					maxDepthReached,
					totalDepth,
					topicTreeState: topicTreeData,
					currentPath: state.currentPath,
					exhaustedTopics: state.exhaustedTopics,
					updatedAt: new Date(),
				})
				.where(eq(interviewSessions.id, sessionId))

			console.log(`✅ Session metrics updated: ${sessionId}`)
		} catch (error) {
			console.error('❌ Failed to update session metrics:', error)
		}
	}

	/**
	 * Get or create interview session
	 */	

	// TODO: USE AFTER
	async getOrCreateSession(userId: string, sessionId: string) {
		try {
			// Check if session exists
			const existing = await db.query.interviewSessions.findFirst({
				where: eq(interviewSessions.id, sessionId),
			})

			if (existing) {
				console.log(`✅ Session exists: ${existing.id}`)
				return existing
			}

			// Create new session
			console.log('🆕 Creating new interview session...')
			const inserted = await db.insert(interviewSessions).values({
				id: sessionId,
				userId: userId,
				sessionType: 'interview',
				title: 'AI Interview Session',
				description: 'Adaptive interview session for skill assessment',
				status: 'active',
			}).returning()

			console.log('✅ Session created:', inserted[0].id)
			return inserted[0]
		} catch (error) {
			console.error('❌ Failed to get or create session:', error)
			throw error
		}
	}

	/**
	 * Store conversation embedding for RAG
	 */

	// TODO: USE AFTER
	async storeConversationEmbedding(
		content: string, 
		userId: string, 
		sessionId: string, 
		messageIndex: number
	): Promise<void> {
		try {
			console.log('💾 Storing conversation embedding for RAG...')
			
			// Import embedOne function
			const { embedOne } = await import('~/utils/embeddings')
			
			// Generate embedding
			const embedding = await embedOne(content)
			
			if (!embedding || embedding.length === 0) {
				console.log('⚠️ No embedding generated, skipping storage')
				return
			}

			// Store in database
			const { embeddings } = await import('~/db/models/embeddings')
			await db.insert(embeddings).values({
				userId,
				sessionId,
				content,
				embedding,
				messageIndex,
			})

			console.log('✅ Conversation embedding stored successfully')
		} catch (error) {
			console.log('⚠️ Failed to store conversation embedding:', error.message)
			throw error
		}
	}
}
