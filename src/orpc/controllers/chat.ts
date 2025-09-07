// import { and, desc, eq } from 'drizzle-orm'
// import { z } from 'zod'

// import { db } from '~/db'
// import { mastra } from '~/lib/mastra'

// import { protectedBase } from '../middleware/bases'

// export const sendMessage = protectedBase
// 	.input(
// 		z.object({
// 			message: z.string().min(1, 'Message cannot be empty').max(10000, 'Message too long'),
// 			conversationId: z.string().uuid().optional(),
// 		}),
// 	)
// 	.handler(async ({ input, context }) => {
// 		const { message: userMessage, conversationId } = input
// 		const userId = context.auth.user.id

// 		// Start a database transaction
// 		const result = await db.transaction(async (tx) => {
// 			let currentConversationId = conversationId

// 			// Create new conversation if none provided
// 			if (!currentConversationId) {
// 				const [newConversation] = await tx
// 					.insert(conversations)
// 					.values({
// 						userId,
// 						title: null, // Will be set later if needed
// 					})
// 					.returning({ id: conversations.id })

// 				currentConversationId = newConversation.id
// 			} else {
// 				// Verify the conversation belongs to the user
// 				const existingConversation = await tx
// 					.select({ id: conversations.id })
// 					.from(conversations)
// 					.where(and(eq(conversations.id, currentConversationId), eq(conversations.userId, userId)))
// 					.limit(1)

// 				if (existingConversation.length === 0) {
// 					throw new Error('Conversation not found or access denied')
// 				}
// 			}

// 			// Insert user message
// 			const [userMessageRecord] = await tx
// 				.insert(messages)
// 				.values({
// 					conversationId: currentConversationId,
// 					role: 'user',
// 					content: userMessage,
// 				})
// 				.returning()

// 			// Get conversation history for context
// 			const conversationHistory = await tx
// 				.select({
// 					role: messages.role,
// 					content: messages.content,
// 				})
// 				.from(messages)
// 				.where(eq(messages.conversationId, currentConversationId))
// 				.orderBy(messages.createdAt)

// 			// Prepare messages for Mastra agent - use the conversation history as context
// 			const conversationText = conversationHistory
// 				.map((msg) => `${msg.role}: ${msg.content}`)
// 				.join('\n')

// 			// Generate AI response using Mastra with the new user message
// 			const agentResponse = await mastra.getAgent('careerInterviewerAgent').generateVNext([
// 				{ role: 'system', content: 'Previous conversation:\n' + conversationText },
// 				{ role: 'user', content: userMessage },
// 			])

// 			// Insert AI response
// 			const [aiMessageRecord] = await tx
// 				.insert(messages)
// 				.values({
// 					conversationId: currentConversationId,
// 					role: 'assistant',
// 					content: agentResponse.text,
// 				})
// 				.returning()

// 			return {
// 				userMessage: userMessageRecord,
// 				aiMessage: aiMessageRecord,
// 				conversationId: currentConversationId,
// 			}
// 		})

// 		// Return the AI message as the response
// 		return {
// 			message: {
// 				id: result.aiMessage.id,
// 				conversationId: result.conversationId,
// 				role: result.aiMessage.role,
// 				content: result.aiMessage.content,
// 				createdAt: result.aiMessage.createdAt,
// 			},
// 			conversationId: result.conversationId,
// 		}
// 	})

// export const getConversation = protectedBase
// 	.input(
// 		z.object({
// 			conversationId: z.string().uuid(),
// 		}),
// 	)
// 	.handler(async ({ input, context }) => {
// 		const { conversationId } = input
// 		const userId = context.auth.user.id

// 		// Get conversation with messages
// 		const conversationData = await db
// 			.select({
// 				id: conversations.id,
// 				userId: conversations.userId,
// 				title: conversations.title,
// 				createdAt: conversations.createdAt,
// 				updatedAt: conversations.updatedAt,
// 			})
// 			.from(conversations)
// 			.where(and(eq(conversations.id, conversationId), eq(conversations.userId, userId)))
// 			.limit(1)

// 		if (conversationData.length === 0) {
// 			throw new Error('Conversation not found or access denied')
// 		}

// 		const conversation = conversationData[0]

// 		// Get all messages for this conversation
// 		const conversationMessages = await db
// 			.select({
// 				id: messages.id,
// 				conversationId: messages.conversationId,
// 				role: messages.role,
// 				content: messages.content,
// 				createdAt: messages.createdAt,
// 			})
// 			.from(messages)
// 			.where(eq(messages.conversationId, conversationId))
// 			.orderBy(messages.createdAt)

// 		return {
// 			id: conversation.id,
// 			userId: conversation.userId,
// 			title: conversation.title,
// 			createdAt: conversation.createdAt,
// 			updatedAt: conversation.updatedAt,
// 			messages: conversationMessages,
// 		}
// 	})

// export const listConversations = protectedBase.handler(async ({ context }) => {
// 	const userId = context.auth.user.id

// 	// Get all conversations for the user
// 	const userConversations = await db
// 		.select({
// 			id: conversations.id,
// 			userId: conversations.userId,
// 			title: conversations.title,
// 			createdAt: conversations.createdAt,
// 			updatedAt: conversations.updatedAt,
// 		})
// 		.from(conversations)
// 		.where(eq(conversations.userId, userId))
// 		.orderBy(desc(conversations.updatedAt))

// 	// For each conversation, get the most recent message
// 	const conversationsWithLastMessage = await Promise.all(
// 		userConversations.map(async (conversation) => {
// 			const lastMessage = await db
// 				.select({
// 					content: messages.content,
// 					role: messages.role,
// 					createdAt: messages.createdAt,
// 				})
// 				.from(messages)
// 				.where(eq(messages.conversationId, conversation.id))
// 				.orderBy(desc(messages.createdAt))
// 				.limit(1)

// 			return {
// 				...conversation,
// 				lastMessage: lastMessage.length > 0 ? lastMessage[0] : null,
// 			}
// 		}),
// 	)

// 	return conversationsWithLastMessage
// })

// export default {
// 	sendMessage,
// 	getConversation,
// 	listConversations,
// }
