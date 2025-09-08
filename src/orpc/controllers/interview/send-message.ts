import { streamToEventIterator } from '@orpc/server'
import {
	convertToModelMessages,
	smoothStream,
	streamText,
	validateUIMessages,
	type UIMessage,
} from 'ai'
import z from 'zod'

import { mastra } from '~/ai/mastra'
import { protectedBase } from '~/orpc/middleware/bases'

const AGENT = mastra.getAgent('careerInterviewerAgent')

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
		const stream = await AGENT.streamVNext([input.message], {
			format: 'aisdk',
		})

		return streamToEventIterator(stream.toUIMessageStream())
	})
