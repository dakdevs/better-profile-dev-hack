import { createORPCClient, onError } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { RouterClient } from '@orpc/server'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'

import { router } from './router'

declare global {
	var $client: RouterClient<typeof router> | undefined
}

const link = new RPCLink({
	url: `${typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000'}/rpc`,
	headers: async () => {
		if (typeof window !== 'undefined') {
			return {}
		}

		const { headers } = await import('next/headers')

		const derivedHeaders = {
			...Object.fromEntries(await headers()),
		}

		if (typeof window !== 'undefined') {
			derivedHeaders['x-timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone
		}

		return derivedHeaders
	},
	interceptors: [
		onError((error) => {
			console.error(error)
		}),
	],
})

export const client: RouterClient<typeof router> = globalThis.$client ?? createORPCClient(link)

export const orpcClient = createTanstackQueryUtils(client)
