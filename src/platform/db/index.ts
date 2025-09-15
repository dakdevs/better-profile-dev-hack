import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { serverConfig } from '~/config/server-config'

import * as schema from './schema'

const pool = new Pool({
	connectionString: serverConfig.db.url,
})

export const db = drizzle(pool, { schema })
