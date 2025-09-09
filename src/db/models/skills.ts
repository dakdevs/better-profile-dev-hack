// src/db/models/skills.ts
import { pgTable, text, timestamp, index, integer, bigserial, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { interviewSessions } from './interviews';

export const userSkills = pgTable('user_skills', {
	id: text('id').primaryKey(),
	userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // Changed to uuid
	skillName: text('skill_name').notNull(),
	mentionCount: integer('mention_count').notNull().default(0),
	lastMentioned: timestamp('last_mentioned').notNull().defaultNow(),
	proficiencyScore: text('proficiency_score').notNull().default('0'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
	userSkillIndex: index('user_skills_user_skill_idx').on(table.userId, table.skillName),
}));

export const skillMentions = pgTable('skill_mentions', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	userSkillId: text('user_skill_id').notNull().references(() => userSkills.id, { onDelete: 'cascade' }),
	userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // Changed to uuid
	sessionId: text('session_id').references(() => interviewSessions.id, { onDelete: 'cascade' }),
	mentionText: text('mention_text'),
	confidence: text('confidence'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
	userSkillIndex: index('skill_mentions_user_skill_idx').on(table.userSkillId),
}));