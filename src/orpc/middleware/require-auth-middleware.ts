import { os } from '@orpc/server'

import { GetOutputContext } from '../helpers.lib'
import { useAuthMiddleware } from './use-auth-middleware'

export const requireAuthMiddleware = useAuthMiddleware.concat(
	os
		.errors({
			UNAUTHORIZED: {
				message: 'unauthorized',
			},
		})
		.$context<GetOutputContext<typeof useAuthMiddleware>>()
		.middleware(async ({ context, next, errors }) => {
			if (!context.auth) {
				throw errors.UNAUTHORIZED()
			}

			return next({
				context: {
					auth: context.auth,
				},
			})
		}),
)
