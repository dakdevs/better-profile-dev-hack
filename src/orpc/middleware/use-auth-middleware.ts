import { os } from '@orpc/server'

import { getSession } from '~/lib/auth'

export const useAuthMiddleware = os.middleware(async ({ next }) => {
	return await next({
		context: {
			auth: await getSession(),
		},
	})
})
