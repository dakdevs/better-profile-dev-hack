import { adminClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { publicConfig } from '~/config/public-config'

export const authClient = createAuthClient({
	plugins: [adminClient()],
	baseURL: publicConfig.app.host,
})

export async function signInWithDiscord() {
	return await authClient.signIn.social({
		provider: 'discord',
	})
}

export async function connectLinkedIn({ callbackURL }: { callbackURL: string }) {
	return await authClient.linkSocial({
		provider: 'linkedin',
		requestSignUp: false,
		callbackURL,
	})
}

export async function connectTwitter({ callbackURL }: { callbackURL: string }) {
	return await authClient.linkSocial({
		provider: 'twitter',
		requestSignUp: false,
		callbackURL,
	})
}

export async function disconnectLinkedIn() {
	return await authClient.unlinkAccount({
		providerId: 'linkedin',
	})
}

export const { useSession, signOut, listAccounts } = authClient
