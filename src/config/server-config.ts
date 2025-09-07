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
		clientId: env.CALCOM_CLIENT_ID,
		clientSecret: env.CALCOM_CLIENT_SECRET,
		organizationId: env.CALCOM_ORGANIZATION_ID,
	},
}
