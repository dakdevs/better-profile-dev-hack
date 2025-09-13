import { os } from '@orpc/server'

export const errorLoggingMiddleware = os.middleware(async ({ next, procedure }) => {
	try {
		return await next()
	} catch (error) {
		console.error('[oRPC Error]', {
			procedure: procedure?.['~orpc']?.route,
			error,
		})

		throw error
	}
})
