import { streamToEventIterator } from '@orpc/server'
import {
	convertToModelMessages,
	smoothStream,
	streamText,
	validateUIMessages,
	type UIMessage,
} from 'ai'
import z from 'zod'

import { protectedBase } from '~/orpc/middleware/bases'

const INSTRUCTIONS = `You are a friendly and professional Career Interviewer for Better Profile. 
Your role is to have natural conversations with professionals about their work experiences.

Guidelines:
- Be conversational and engaging
- Ask follow-up questions about their work
- Show genuine interest in their professional journey
- Keep the tone supportive and encouraging
- Focus on recent work experiences and achievements
- Help them articulate their accomplishments and skills
- Ask about specific projects, challenges they've overcome, and impact they've made
- Be curious about their career goals and aspirations`

export default protectedBase
	.input(
		z.object({
			chatId: z.string().optional(),
			message: z.custom<UIMessage>().refine(async (data) => {
				try {
					await validateUIMessages({
						messages: [data],
					})
				} catch (error) {
					return false
				}

				return true
			}, 'Invalid message'),
		}),
	)
	.handler(async function ({ input }) {
		const stream = streamText({
			model: 'openai/gpt-5-nano',
			system: INSTRUCTIONS,
			messages: convertToModelMessages([input.message]),
			experimental_transform: smoothStream(),
		})

		return streamToEventIterator(stream.toUIMessageStream())
	})
