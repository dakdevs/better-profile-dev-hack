import { os } from '@orpc/server'
import { RequestHeadersPluginContext } from '@orpc/server/plugins'

import { errorLoggingMiddleware } from './error-logging-middleware'
import { requireAuthMiddleware } from './require-auth-middleware'
import { useAuthMiddleware } from './use-auth-middleware'

export const publicBase = os
	.$context<RequestHeadersPluginContext>()
	.use(errorLoggingMiddleware)
	.use(useAuthMiddleware)
export const protectedBase = publicBase.use(errorLoggingMiddleware).use(requireAuthMiddleware)
