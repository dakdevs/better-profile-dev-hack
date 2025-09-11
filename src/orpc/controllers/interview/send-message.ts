import { streamToEventIterator } from '@orpc/server'
import { convertToModelMessages, validateUIMessages, type UIMessage } from 'ai'
import z from 'zod'

import { mastra } from '~/ai/mastra'
import { protectedBase } from '~/orpc/middleware/bases'
import { InterviewRAGAgent } from '~/services/rag-agent' // Import our new agent

// Instantiate the RAG agent
const ragAgent = new InterviewRAGAgent()

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

		// --- RAG Agent Integration ---
		// 1. Process the user's query with the RAG agent first
		const ragResponse = await ragAgent.processQuery(userMessageContent, userId)

		// 2. If the RAG agent blocks the query, return its response directly (not implemented yet, but good practice)
		if (!ragResponse.isRelevant && ragResponse.response) {
			// In the future, we could stream this response back. For now, we proceed.
			console.log('RAG Agent blocked off-topic query.')
		}

		// 3. Use the enhanced prompt from the RAG agent for the main AI
		const promptForMastra = ragResponse.enhancedPrompt || userMessageContent

		// --- Original Mastra Agent Call ---
		const agent = mastra.getAgent('careerInterviewerAgent')

		// Modify the user message content with our new enhanced prompt
		const modifiedUIMessage: UIMessage = {
			...input.message,
			parts: [{ type: 'text', text: promptForMastra }],
		}

		const stream = await agent.streamVNext(convertToModelMessages([modifiedUIMessage]))

		return streamToEventIterator(stream.aisdk.v5.toUIMessageStream())
	})
