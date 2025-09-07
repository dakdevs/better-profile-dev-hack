import z from 'zod'

import { db } from '~/db'
import { protectedBase } from '~/orpc/middleware/bases'

export default protectedBase
	.input(
		z.object({
			cursor: z
				.object({
					createdAt: z.date(),
					id: z.string().uuid(),
				})
				.optional(),
		}),
	)
	.handler(async function ({ input, context }) {
		const { cursor } = input
		const { id: userId } = context.auth.user

		const conversations = await db.query.interviewMessages.findMany({
			where: (conversations, { or, and, gt, eq }) => {
				if (cursor) {
					return and(
						or(gt(conversations.createdAt, cursor.createdAt), gt(conversations.id, cursor.id)),
						eq(conversations.userId, userId),
					)
				}

				return eq(conversations.userId, userId)
			},
			columns: {
				id: true,
				createdAt: true,
				role: true,
				content: true,
			},
			orderBy: (messages, { desc }) => desc(messages.createdAt),
			limit: 2,
		})

		return {
			message: conversations[0] ?? null,
		}
	})
