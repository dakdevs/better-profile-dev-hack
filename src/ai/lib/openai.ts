import { createOpenAI } from '@ai-sdk/openai'

import { serverConfig } from '~/config/server-config'

export const openai = createOpenAI({
	apiKey: serverConfig.openai.apiKey,
})

export const createOpenAIGatewayWithSupermemory = (superMemoryUserId: string) => {
	return createOpenAI({
		apiKey: serverConfig.openai.apiKey,
		baseURL: 'https://api.supermemory.ai/v3/https://api.openai.com/v1',
		headers: {
			'x-supermemory-api-key': serverConfig.supermemory.key,
			'x-sm-user-id': superMemoryUserId,
		},
	})
}
