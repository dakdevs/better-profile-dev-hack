import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { timestamps } from '../utils'
import { users } from './users'

export const sessions = pgTable(
	'sessions',
	{
		// Base fields
		id: uuid().primaryKey().defaultRandom(),
		userId: uuid()
			.notNull()
			.references(() => users.id),
		token: text().notNull(),
		expiresAt: timestamp().notNull(),
		ipAddress: text(),
		userAgent: text(),
		...timestamps,

		// Admin plugin
		impersonatedBy: uuid(),
	},
	(table) => {
		return [index().on(table.userId), index().on(table.token)]
	},
)

export const sessionRelations = relations(sessions, ({ one }) => {
	return {
		user: one(users, {
			fields: [sessions.userId],
			references: [users.id],
		}),
	}
})
