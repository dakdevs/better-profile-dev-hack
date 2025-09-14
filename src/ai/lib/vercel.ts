import { createGateway } from '@ai-sdk/gateway'

import { serverConfig } from '~/config/server-config'

export const vercel = createGateway({
	apiKey: serverConfig.vercel.apiKey,
})

export const createVercelGatewayWithSupermemory = (superMemoryUserId: string) => {
	return createGateway({
		apiKey: serverConfig.vercel.apiKey,
		baseURL: 'https://api.supermemory.ai/v3/https://ai-gateway.vercel.sh/v1',
		headers: {
			'x-supermemory-api-key': serverConfig.supermemory.key,
			'x-sm-user-id': superMemoryUserId,
		},
	})
}
