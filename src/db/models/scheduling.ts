import { pgTable, text, timestamp, boolean, jsonb, index, integer, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { jobPostings } from './jobs';
import { recruiterProfiles } from './recruiter';

// Candidate availability table
export const candidateAvailability = pgTable('candidate_availability', {
	id: text('id').primaryKey(),
	userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	startTime: timestamp('start_time').notNull(),
	endTime: timestamp('end_time').notNull(),
	timezone: text('timezone').notNull().default('UTC'),
	status: text('status').notNull().default('available'), // e.g., available, booked
}, (table) => ({
	userIndex: index('candidate_availability_user_idx').on(table.userId),
}));

// Interview sessions for scheduling
export const interviewSessionsScheduled = pgTable('interview_sessions_scheduled', {
	id: text('id').primaryKey(),
	jobPostingId: text('job_posting_id').references(() => jobPostings.id, { onDelete: 'set null' }),
	candidateId: uuid('candidate_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	recruiterId: text('recruiter_id').references(() => recruiterProfiles.id, { onDelete: 'set null' }),
	scheduledStart: timestamp('scheduled_start').notNull(),
	scheduledEnd: timestamp('scheduled_end').notNull(),
	timezone: text('timezone').notNull().default('UTC'),
	status: text('status').notNull().default('scheduled'), // e.g., scheduled, confirmed, completed, cancelled
	meetingLink: text('meeting_link'),
	notes: text('notes'),
	calComBookingId: integer('cal_com_booking_id'),
}, (table) => ({
	jobPostingIndex: index('scheduled_interviews_job_idx').on(table.jobPostingId),
	candidateIndex: index('scheduled_interviews_candidate_idx').on(table.candidateId),
	recruiterIndex: index('scheduled_interviews_recruiter_idx').on(table.recruiterId),
}));