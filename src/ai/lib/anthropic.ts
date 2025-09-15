import { createAnthropic } from '@ai-sdk/anthropic'

import { serverConfig } from '~/config/server-config'

export const anthropic = createAnthropic({
	apiKey: serverConfig.anthropic.apiKey,
})

export const createAnthropicGatewayWithSupermemory = (superMemoryUserId: string) => {
	return createAnthropic({
		apiKey: serverConfig.anthropic.apiKey,
		baseURL: 'https://api.supermemory.ai/v3/https://api.anthropic.com/v1',
		headers: {
			'x-supermemory-api-key': serverConfig.supermemory.key,
			'x-sm-user-id': superMemoryUserId,
		},
	})
}
