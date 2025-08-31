import { drizzle } from 'drizzle-orm/node-postgres'

import { serverConfig } from '~/config/server-config'

import * as schema from './models'

export const primaryDb = drizzle(serverConfig.db.url, {
	schema,
	casing: 'snake_case',
})
