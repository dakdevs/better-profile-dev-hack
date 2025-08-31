import { relations } from 'drizzle-orm'
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { timestamps } from '../utils'
import { accounts } from './accounts'
import { sessions } from './sessions'

export const users = pgTable('users', {
	// Base fields
	id: uuid().primaryKey().defaultRandom(),
	name: text().notNull(),
	email: text().notNull().unique(),
	emailVerified: boolean().notNull().default(false),
	image: text(),
	...timestamps,

	// Admin plugin
	role: text(),
	banned: boolean(),
	banReason: text(),
	banExpires: timestamp(),
})

export const userRelations = relations(users, ({ many }) => {
	return {
		sessions: many(sessions),
		accounts: many(accounts),
	}
})
