import z from 'zod'

import { db } from '~/db'
import { recruitSettings } from '~/db/models'
import { protectedBase } from '~/orpc/middleware/bases'

export default protectedBase
	.errors({
		INVALID_API_KEY: {
			status: 400,
			message: 'Invalid API key',
		},
	})
	.input(
		z.object({
			apiKey: z.string().min(1, 'API key is required'),
		}),
	)
	.handler(async ({ input, context, errors }) => {
		const isValid = await isValidApiKey(input.apiKey)

		if (!isValid) {
			throw errors.INVALID_API_KEY
		}

		await db
			.insert(recruitSettings)
			.values({
				userId: context.auth.user.id,
				calcomApiKey: input.apiKey,
			})
			.onConflictDoUpdate({
				target: [recruitSettings.userId],
				set: {
					calcomApiKey: input.apiKey,
				},
			})
	})

async function isValidApiKey(apiKey: string) {
	const response = await fetch(`https://api.cal.com/v2/me`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
	})

	if (!response.ok) {
		const errorResponse = (await response.json()) as Record<string, unknown>
		console.error('Failed to test API key', errorResponse)

		return false
	}

	const data = (await response.json()) as {
		status: 'success' | 'error'
	}

	return data.status === 'success'
}
