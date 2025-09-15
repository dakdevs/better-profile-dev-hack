import { relations } from 'drizzle-orm'
import { index, integer, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { timestamps } from '../utils'
import { users } from './users'

export const jobPostings = pgTable(
	'job_postings',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		title: text('title').notNull(),
		rawDescription: text('raw_description').notNull(),
		extractedSkills: jsonb('extracted_skills'),
		requiredSkills: jsonb('required_skills'),
		preferredSkills: jsonb('preferred_skills'),
		experienceLevel: text('experience_level'),
		salaryMin: integer('salary_min'),
		salaryMax: integer('salary_max'),
		...timestamps,
	},
	(table) => [index().on(table.userId), index().on(table.title), index().on(table.experienceLevel)],
)

export const jobPostingsRelations = relations(jobPostings, ({ one }) => ({
	user: one(users, {
		fields: [jobPostings.userId],
		references: [users.id],
	}),
}))
