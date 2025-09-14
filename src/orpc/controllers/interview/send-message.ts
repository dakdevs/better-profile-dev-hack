import { after } from 'next/server'
import { streamToEventIterator } from '@orpc/server'
import {
	convertToModelMessages,
	smoothStream,
	streamText,
	validateUIMessages,
	type UIMessage,
} from 'ai'
import { after } from 'next/server'
import { Agent } from '@mastra/core'
import z from 'zod'

import { vercel } from '~/ai/lib/vercel'
import { db } from '~/db'
import { interviewMessages } from '~/db/models'
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
