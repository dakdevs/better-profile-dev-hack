import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { timestamps } from '../utils'

export const verifications = pgTable(
	'verifications',
	{
		id: uuid().primaryKey().defaultRandom(),
		identifier: text().notNull(),
		value: text().notNull(),
		expiresAt: timestamp().notNull(),
		...timestamps,
	},
	(table) => {
		return [index().on(table.identifier)]
	},
)
