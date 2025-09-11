// src/db/models/jobs.ts
import {
	boolean,
	decimal,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
} from 'drizzle-orm/pg-core'

import { recruiterProfiles } from './recruiter'

export const jobPostings = pgTable(
	'job_postings',
	{
		id: text('id').primaryKey(),
		recruiterId: text('recruiter_id')
			.notNull()
			.references(() => recruiterProfiles.id, { onDelete: 'cascade' }),
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
	},
	[
		index('job_postings_recruiter_idx').on(['recruiter_id']),
		index('job_postings_status_idx').on(['status']),
		index('job_postings_title_idx').on(['title']),
		index('job_postings_location_idx').on(['location']),
		index('job_postings_experience_level_idx').on(['experience_level']),
	],
)
