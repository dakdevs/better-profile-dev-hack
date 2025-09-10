import { pgTable, text, decimal, jsonb, index, uuid } from 'drizzle-orm/pg-core';
import { jobPostings } from './jobs';
import { users } from './users';

export const candidateJobMatches = pgTable('candidate_job_matches', {
	id: text('id').primaryKey(),
	jobPostingId: text('job_posting_id').notNull().references(() => jobPostings.id, { onDelete: 'cascade' }),
	candidateId: uuid('candidate_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	matchScore: decimal('match_score', { precision: 5, scale: 2 }).notNull(),
	matchingSkills: jsonb('matching_skills'),
	skillGaps: jsonb('skill_gaps'),
	overallFit: text('overall_fit'),
}, (table) => ({
	jobPostingIndex: index('candidate_job_matches_job_posting_idx').on(table.jobPostingId),
	candidateIndex: index('candidate_job_matches_candidate_idx').on(table.candidateId),
}));