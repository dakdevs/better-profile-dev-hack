import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { users } from '~/db/models/users'

import { timestamps } from '../utils'

export const userSkills = pgTable(
	'user_skills',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }), // Changed to uuid
		skillName: text('skill_name').notNull(),
		mentionCount: integer('mention_count').notNull().default(0),
		lastMentioned: timestamp('last_mentioned').notNull().defaultNow(),
		proficiencyScore: text('proficiency_score').notNull().default('0'),
		averageConfidence: text('average_confidence').default('0'),
		averageEngagement: text('average_engagement').default('medium'),
		topicDepthAverage: text('topic_depth_average').default('0'),
		synonyms: text('synonyms'),
		...timestamps,
	},
	(table) => [index('user_skills_user_skill_idx').on(table.userId, table.skillName)],
)
