import { env, isDevelopment } from './env'

export const serverConfig = {
	app: {
		isDevelopment,
	},
	db: {
		url: env.POSTGRES_DATABASE_URL,
	},
	betterAuth: {
		secret: env.BETTER_AUTH_SECRET,
	},
}
