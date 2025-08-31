import { env, isDevelopment } from './env'

export const publicConfig = {
	app: {
		isDevelopment,
		host: env.NEXT_PUBLIC_APP_HOST,
	},
}
