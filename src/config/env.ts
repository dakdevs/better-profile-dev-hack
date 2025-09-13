import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const isDevelopment = process.env.NODE_ENV !== 'production'

export const env = createEnv({
	client: {
		NEXT_PUBLIC_APP_HOST: isDevelopment
			? z.string().url().default('http://localhost:3000')
			: z.string().url(),
	},
	server: {
		NODE_ENV: z.string().default('development'),
		BETTER_AUTH_SECRET: z.string(),
		GOOGLE_CLIENT_ID: z.string(),
		GOOGLE_CLIENT_SECRET: z.string(),
		OPENAI_API_KEY: z.string(),
		OPENROUTER_API_KEY: z.string(),
		DATABASE_URL: isDevelopment
			? z.string().default('postgresql://betterprofile:betterprofile@localhost:5432/betterprofile')
			: z.string(),
		CALCOM_CLIENT_ID: z.string(),
		CALCOM_CLIENT_SECRET: z.string(),
		CALCOM_ORGANIZATION_ID: z.string(),
		AI_GATEWAY_API_KEY: isDevelopment ? z.string() : z.string().optional(),
	},
	runtimeEnv: {
		NEXT_PUBLIC_APP_HOST: process.env.NEXT_PUBLIC_APP_HOST,
		DATABASE_URL: process.env.DATABASE_URL,
		NODE_ENV: process.env.NODE_ENV,
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
		OPENAI_API_KEY: process.env.OPENAI_API_KEY,
		OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
		CALCOM_CLIENT_ID: process.env.CALCOM_CLIENT_ID,
		CALCOM_CLIENT_SECRET: process.env.CALCOM_CLIENT_SECRET,
		CALCOM_ORGANIZATION_ID: process.env.CALCOM_ORGANIZATION_ID,
		AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
	},
	emptyStringAsUndefined: true,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
