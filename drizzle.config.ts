import { defineConfig } from 'drizzle-kit'

import { serverConfig } from '~/config/server-config'

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/db/models/index.ts',
	dbCredentials: {
		url: serverConfig.db.url,
	},
	out: './src/db/migrations',
	strict: true,
	verbose: true,
	casing: 'snake_case',
})
