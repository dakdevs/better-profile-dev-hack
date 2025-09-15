import { relations } from 'drizzle-orm'
import { index, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { timestamps } from '../utils'
import { users } from './users'

export const recruitSettings = pgTable(
	'recruit_settings',
	{
		id: uuid().primaryKey().defaultRandom(),
		userId: uuid()
			.notNull()
			.unique()
			.references(() => users.id),
		calcomApiKey: text(),
		...timestamps,
	},
	(table) => {
		return [index().on(table.userId)]
	},
)

export const recruitSettingsRelations = relations(recruitSettings, ({ one }) => {
	return {
		user: one(users, {
			fields: [recruitSettings.userId],
			references: [users.id],
		}),
	}
})
