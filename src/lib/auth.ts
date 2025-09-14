import { cache } from 'react'
import { headers } from 'next/headers'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin, genericOAuth } from 'better-auth/plugins'

import { publicConfig } from '~/config/public-config'
import { serverConfig } from '~/config/server-config'
import { db } from '~/db'
import * as schema from '~/db/models'

export const auth = betterAuth({
	plugins: [
		admin(),
		genericOAuth({
			config: [
				{
					providerId: 'calcom',
					clientId: serverConfig.calcom.clientId,
					clientSecret: serverConfig.calcom.clientSecret,
					authorizationUrl: 'https://app.cal.com/auth/oauth2/authorize',
					tokenUrl: 'https://app.cal.com/api/auth/oauth/token',
				},
			],
		}),
	],
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema: {
			...schema,
		},
		usePlural: true,
	}),
	emailAndPassword: {
		enabled: false,
	},
	socialProviders: {
		google: {
			clientId: serverConfig.auth.google.clientId,
			clientSecret: serverConfig.auth.google.clientSecret,
		},
	},
	trustedOrigins: [publicConfig.app.host],
	secret: serverConfig.betterAuth.secret,
	advanced: {
		database: {
			generateId: false,
		},
	},
})

export const getSession = cache(async function getSession() {
	return auth.api.getSession({
		headers: await headers(),
	})
})

export async function getRequiredSession() {
	const session = await getSession()

	if (!session) {
		throw new Error('No session found')
	}

	return session
}

export const listAccounts = cache(async function () {
	return await auth.api.listUserAccounts({
		headers: await headers(),
	})
})

export async function getProviderAccountInfoByAccountId(accountId: string) {
	return await auth.api.accountInfo({ body: { accountId }, headers: await headers() })
}

export async function getAccountByProvider(provider: 'linkedin') {
	const accounts = await listAccounts()

	const account = accounts.find((account) => {
		return account.providerId === provider
	})

	if (!account) {
		return null
	}

	return account
}
