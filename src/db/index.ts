import { sql, type AnyColumn, type SQL } from 'drizzle-orm'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless'
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'

import { serverConfig } from '~/config/server-config'

import * as schema from './models'

const createNeonDatabaseConnection = () => {
	return drizzleNeon({
		connection: serverConfig.db.url,
		schema,
		logger: true,
		casing: 'snake_case',
	})
}

const createPgDatabaseConnection = () => {
	return drizzlePg({
		connection: serverConfig.db.url,
		schema,
		logger: true,
		casing: 'snake_case',
	})
}

export const db = serverConfig.app.isDevelopment
	? createPgDatabaseConnection()
	: createNeonDatabaseConnection()

/* eslint-disable-next-line no-restricted-syntax */
export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

export const increment = (column: AnyColumn, value = 1) => {
	return sql`${column} + ${value}`
}

export const decrement = (column: AnyColumn, value = 1) => {
	return sql`${column} + ${value}`
}

export const sqlCase = (...whenSql: SQL[]) => {
	const aggregatedSql = whenSql.reduce(
		(aggregatedSql, rawSql, index) => {
			if (index !== 0) {
				return aggregatedSql.append(sql` `).append(rawSql)
			}

			return aggregatedSql.append(rawSql)
		},
		sql``,
	)

	return sql`(CASE ${aggregatedSql} END)`
}

export const when = (condition: SQL, outcome: string | number | SQL) => {
	if (typeof outcome === 'number') {
		return sql`WHEN ${condition} THEN ${sql`${outcome}::integer`.mapWith(Number)}`
	}

	return sql`WHEN ${condition} THEN ${outcome}`
}
