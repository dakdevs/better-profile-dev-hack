import { z } from 'zod'

import { db } from '~/db'
import { protectedBase } from '~/orpc/middleware/bases'

export default protectedBase
	.input(
		z
			.object({
				cursor: z
					.object({
						createdAt: z.date(),
						id: z.uuid(),
					})
					.optional(),
			})
			.default({}),
	)
	.handler(async function ({ input, context }) {
		const { cursor } = input
		const { id: userId } = context.auth.user

		const conversations = await db.query.interviewMessages.findMany({
			where: (interviewMessages, { or, and, gt, eq }) => {
				if (cursor) {
					return and(
						or(
							gt(interviewMessages.createdAt, cursor.createdAt),
							gt(interviewMessages.id, cursor.id),
						),
						eq(interviewMessages.userId, userId),
					)
				}

				return eq(interviewMessages.userId, userId)
			},
			columns: {
				id: true,
				createdAt: true,
				role: true,
				content: true,
			},
			orderBy: (interviewMessages, { asc }) => asc(interviewMessages.createdAt),
		})

		return {
			messages: conversations,
		}
	})
