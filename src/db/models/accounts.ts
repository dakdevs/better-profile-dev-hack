import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { timestamps } from '../utils'
import { users } from './users'

export const accounts = pgTable(
	'accounts',
	{
		id: uuid().primaryKey().defaultRandom(),
		userId: uuid()
			.notNull()
			.references(() => users.id),
		accountId: text().notNull(),
		providerId: text().notNull(),
		accessToken: text(),
		refreshToken: text(),
		accessTokenExpiresAt: timestamp(),
		refreshTokenExpiresAt: timestamp(),
		scope: text(),
		idToken: text(),
		password: text(),
		...timestamps,
	},
	(table) => {
		return [index().on(table.userId)]
	},
)

export const accountRelations = relations(accounts, ({ one }) => {
	return {
		user: one(users, {
			fields: [accounts.userId],
			references: [users.id],
		}),
	}
})
