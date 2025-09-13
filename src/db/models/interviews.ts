// src/db/models/interviews.ts
import { index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { users } from './users'

export const interviewSessions = pgTable(
	'interview_sessions',
	{
		id: text('id').primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }), // Changed to uuid
		sessionType: text('session_type').notNull().default('interview'),
		title: text('title'),
		description: text('description'),
		duration: integer('duration'),
		messageCount: integer('message_count').notNull().default(0),
		averageEngagement: text('average_engagement').default('medium'),
		overallScore: text('overall_score').default('0'),
		topicsExplored: jsonb('topics_explored'),
		skillsIdentified: jsonb('skills_identified'),
		finalAnalysis: jsonb('final_analysis'),
		buzzwords: jsonb('buzzwords'),
		maxDepthReached: integer('max_depth_reached').default(0),
		totalDepth: integer('total_depth').default(0),
		topicTreeState: jsonb('topic_tree_state'),
		currentPath: jsonb('current_path'),
		exhaustedTopics: jsonb('exhausted_topics'),
		status: text('status').notNull().default('active'),
		startedAt: timestamp('started_at').notNull().defaultNow(),
		completedAt: timestamp('completed_at'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow(),
	},
	(table) => [index('interview_sessions_user_idx').on(table.userId)],
)
