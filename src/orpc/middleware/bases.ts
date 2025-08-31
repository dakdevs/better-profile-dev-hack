import { os } from '@orpc/server'
import { RequestHeadersPluginContext } from '@orpc/server/plugins'

import { requireAuthMiddleware } from './require-auth-middleware'
import { useAuthMiddleware } from './use-auth-middleware'

export const publicBase = os.$context<RequestHeadersPluginContext>().use(useAuthMiddleware)
export const protectedBase = publicBase.use(requireAuthMiddleware)
