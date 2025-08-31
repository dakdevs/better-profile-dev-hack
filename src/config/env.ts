import { createEnv } from '@t3-oss/env-nextjs'
import { _dev_secret_jit } from '~/lib/dev-secret-jit'
import { z } from 'zod'

export const isDevelopment = process.env.NODE_ENV !== 'production'

export const env = createEnv({
	client: {
		NEXT_PUBLIC_APP_HOST: z.url(),
	},
	server: {
		POSTGRES_DATABASE_URL: isDevelopment
			? z.string().optional().default('postgresql://betterprofile:betterprofile@localhost:5432/betterprofile')
			: z.string(),
		NODE_ENV: z.string().default('development'),
		BETTER_AUTH_SECRET: isDevelopment
			? z.string().default(() => _dev_secret_jit('.better-auth.secret'))
			: z.string(),
	},
	runtimeEnv: {
		NEXT_PUBLIC_APP_HOST: process.env.NEXT_PUBLIC_APP_HOST,
		POSTGRES_DATABASE_URL: process.env.DATABASE_URL,
		NODE_ENV: process.env.NODE_ENV,
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
	},
})
