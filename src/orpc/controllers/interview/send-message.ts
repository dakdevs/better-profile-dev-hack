import { streamToEventIterator } from '@orpc/server'
import { convertToModelMessages, validateUIMessages, type UIMessage } from 'ai'
import z from 'zod'

import { mastra } from '~/ai/mastra'
import { protectedBase } from '~/orpc/middleware/bases'

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
		const agent = mastra.getAgent('careerInterviewerAgent')
		const stream = await agent.streamVNext(convertToModelMessages([input.message]))

		return streamToEventIterator(stream.aisdk.v5.toUIMessageStream())
	})
