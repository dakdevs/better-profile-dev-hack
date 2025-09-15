import { env, isDevelopment } from './env'

export const publicConfig = {
	app: {
		isDevelopment,
		host: env.NEXT_PUBLIC_APP_HOST,
	},
	calcom: {
		clientId: env.NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID,
	},
}
