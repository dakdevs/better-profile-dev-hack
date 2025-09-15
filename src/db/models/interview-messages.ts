import { UIMessage } from 'ai'
import { relations } from 'drizzle-orm'
import { index, jsonb, pgEnum, pgTable, uuid } from 'drizzle-orm/pg-core'

import { timestamps } from '../utils'
import { users } from './users'

// Enum for message roles
export const messageRoleEnum = pgEnum('message_role', ['user', 'assistant', 'system'])

export const interviewMessages = pgTable(
	'interview_messages',
	{
		id: uuid().primaryKey().defaultRandom(),
		userId: uuid()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		role: messageRoleEnum().notNull(),
		content: jsonb().$type<UIMessage>().notNull(),
		...timestamps,
	},
	(table) => [index().on(table.userId, table.createdAt, table.id)],
)

export const interviewMessagesRelations = relations(interviewMessages, ({ one }) => ({
	conversation: one(users, {
		fields: [interviewMessages.userId],
		references: [users.id],
	}),
}))
