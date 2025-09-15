import { createAuthClient } from 'better-auth/react'

import { env } from '~/config/env'

export const authClient = createAuthClient({
	baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000',
})
