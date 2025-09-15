import { adminClient, genericOAuthClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { publicConfig } from '~/config/public-config'

export const authClient = createAuthClient({
	plugins: [adminClient(), genericOAuthClient()],
	baseURL: publicConfig.app.host,
})

export async function signInWithGoogle() {
	return await authClient.signIn.social({
		provider: 'google',
	})
}

export const { useSession, signOut, listAccounts } = authClient
