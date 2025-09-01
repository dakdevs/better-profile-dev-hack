import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const isDevelopment = process.env.NODE_ENV !== 'production'

export const env = createEnv({
	client: {
		NEXT_PUBLIC_APP_HOST: isDevelopment ? z.url().default('http://localhost:3000') : z.url(),
	},
	server: {
		POSTGRES_DATABASE_URL: isDevelopment
			? z.string().default('postgresql://betterprofile:betterprofile@localhost:5432/betterprofile')
			: z.string(),
		NODE_ENV: z.string().default('development'),
		BETTER_AUTH_SECRET: z.string(),
		GOOGLE_CLIENT_ID: z.string(),
		GOOGLE_CLIENT_SECRET: z.string(),
	},
	runtimeEnv: {
		NEXT_PUBLIC_APP_HOST: process.env.NEXT_PUBLIC_APP_HOST,
		POSTGRES_DATABASE_URL: process.env.DATABASE_URL,
		NODE_ENV: process.env.NODE_ENV,
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
	},
	emptyStringAsUndefined: true,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
