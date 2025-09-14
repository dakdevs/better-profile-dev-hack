import { createGateway } from '@ai-sdk/gateway'

import { env } from '~/config/env'

export const vercel = createGateway({
	apiKey: env.AI_GATEWAY_API_KEY,
})
