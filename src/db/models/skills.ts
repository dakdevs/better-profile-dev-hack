// src/db/models/skills.ts
import { bigserial, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { interviewSessions } from './interviews'
import { users } from './users'

export const userSkills = pgTable(
	'user_skills',
	{
		id: text('id').primaryKey(),
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
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow(),
	},
	(table) => [index('user_skills_user_skill_idx').on(table.userId, table.skillName)],
)

export const skillMentions = pgTable(
	'skill_mentions',
	{
		id: bigserial('id', { mode: 'number' }).primaryKey(),
		userSkillId: text('user_skill_id')
			.notNull()
			.references(() => userSkills.id, { onDelete: 'cascade' }),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }), // Changed to uuid
		sessionId: text('session_id').references(() => interviewSessions.id, { onDelete: 'cascade' }),
		messageIndex: integer('message_index'),
		mentionText: text('mention_text'),
		confidence: text('confidence'),
		engagementLevel: text('engagement_level'),
		topicDepth: text('topic_depth'),
		conversationContext: text('conversation_context'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
	},
	(table) => [index('skill_mentions_user_skill_idx').on(table.userSkillId)],
)
