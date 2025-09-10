import { pgTable, text, timestamp, boolean, jsonb, integer, decimal, index } from 'drizzle-orm/pg-core';
import { recruiterProfiles } from './recruiter';

export const jobPostings = pgTable('job_postings', {
	id: text('id').primaryKey(),
	recruiterId: text('recruiter_id').notNull().references(() => recruiterProfiles.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	rawDescription: text('raw_description').notNull(),
	extractedSkills: jsonb('extracted_skills'),
	requiredSkills: jsonb('required_skills'),
	preferredSkills: jsonb('preferred_skills'),
	experienceLevel: text('experience_level'),
	salaryMin: integer('salary_min'),
	salaryMax: integer('salary_max'),
	location: text('location'),
	remoteAllowed: boolean('remote_allowed').default(false),
	employmentType: text('employment_type').default('full-time'),
	status: text('status').notNull().default('active'),
	aiConfidenceScore: decimal('ai_confidence_score', { precision: 3, scale: 2 }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
	recruiterIndex: index('job_postings_recruiter_idx').on(table.recruiterId),
	statusIndex: index('job_postings_status_idx').on(table.status),
	titleIndex: index('job_postings_title_idx').on(table.title),
	locationIndex: index('job_postings_location_idx').on(table.location),
	experienceLevelIndex: index('job_postings_experience_level_idx').on(table.experienceLevel),
}));