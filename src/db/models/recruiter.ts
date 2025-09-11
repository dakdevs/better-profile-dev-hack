// src/db/models/recruiter.ts
import { boolean, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { users } from './users'

export const recruiterProfiles = pgTable(
	'recruiter_profiles',
	{
		id: text('id').primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }), // Changed to uuid
		organizationName: text('organization_name').notNull(),
		recruitingFor: text('recruiting_for').notNull(),
		contactEmail: text('contact_email'),
		phoneNumber: text('phone_number'),
		timezone: text('timezone').notNull().default('UTC'),
		calComConnected: boolean('cal_com_connected').default(false),
		calComApiKey: text('cal_com_api_key'),
		calComUsername: text('cal_com_username'),
		calComUserId: integer('cal_com_user_id'),
		calComScheduleId: integer('cal_com_schedule_id'),
		calComEventTypeId: integer('cal_com_event_type_id'),
		createdAt: timestamp('created_at').notNull().defaultNow(),
		updatedAt: timestamp('updated_at').notNull().defaultNow(),
	},
	[
		index('recruiter_profiles_user_idx').on(['user_id']),
		index('recruiter_profiles_organization_idx').on(['organization_name']),
		index('recruiter_profiles_cal_com_user_idx').on(['cal_com_user_id']),
	],
)
