import { env, isDevelopment } from './env'

export const serverConfig = {
	app: {
		isDevelopment,
	},
	db: {
		url: env.DATABASE_URL,
	},
	betterAuth: {
		secret: env.BETTER_AUTH_SECRET,
	},
	auth: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
		},
	},
	calcom: {
		clientId: env.NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID,
		clientSecret: env.CAL_OAUTH_CLIENT_SECRET,
		organizationId: Number(env.CALCOM_ORGANIZATION_ID),
	},
	supermemory: {
		key: env.SUPERMEMORY_KEY,
	},
	vercel: {
		apiKey: env.AI_GATEWAY_API_KEY,
	},
	openai: {
		apiKey: env.OPENAI_API_KEY,
	},
	openRouter: {
		apiKey: env.OPENROUTER_API_KEY,
	},
}
