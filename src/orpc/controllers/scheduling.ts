// src/orpc/controllers/scheduling.ts

import { z } from 'zod';
import { nanoid } from 'nanoid';
import { protectedBase } from '~/orpc/middleware/bases';
import { CalComService, CalComUser, CalComSchedule } from '~/services/cal-com';
import { db } from '~/db';
import { recruiterProfiles } from '~/db/models';
import { eq } from 'drizzle-orm';

// src/orpc/controllers/scheduling.ts

// ... (imports and other procedures remain the same) ...

/**
 * Creates a new booking (schedules an interview).
 */
createBooking: protectedBase
	.input(z.object({
		recruiterId: z.string(),
		jobPostingId: z.string(), // Needed to link the interview to a job
		start: z.string().datetime(),
		end: z.string().datetime(),
		timeZone: z.string(),
		candidateName: z.string(),
		candidateEmail: z.string().email(),
	}))
	.handler(async function({ input, ctx }) {
		const candidate = ctx.user;
		const [recruiter] = await db.select().from(recruiterProfiles).where(eq(recruiterProfiles.id, input.recruiterId)).limit(1);

		if (!recruiter || !recruiter.calComApiKey || !recruiter.calComEventTypeId) {
			throw new Error('Recruiter is not configured for scheduling.');
		}

		const calService = new CalComService(recruiter.calComApiKey);

		// Create the booking via the Cal.com API
		const booking = await calService.createBooking({
			eventTypeId: recruiter.calComEventTypeId,
			start: input.start,
			end: input.end,
			timeZone: input.timeZone,
			responses: { name: input.candidateName, email: input.candidateEmail },
			metadata: {
				candidateId: candidate.id,
				jobPostingId: input.jobPostingId,
			},
		});

		// Save the booking details to our database
		await db.insert(interviewSessionsScheduled).values({
			id: `sched_${nanoid()}`,
			jobPostingId: input.jobPostingId,
			candidateId: candidate.id,
			recruiterId: input.recruiterId,
			scheduledStart: new Date(booking.startTime),
			scheduledEnd: new Date(booking.endTime),
			timezone: booking.attendees[0]?.timeZone || input.timeZone,
			status: 'scheduled',
			meetingLink: booking.location, // Cal.com often puts the meeting link here
			calComBookingId: booking.id,
		});

		return booking;
	}),

// ... (the rest of the file remains the same) ...

export const scheduling = {
	/**
	 * Connects a recruiter's Cal.com account by validating their API key
	 * and saving their details to the database.
	 */
	connectAccount: protectedBase
		.input(z.object({
			calComApiKey: z.string().min(1, 'API Key is required'),
		}))
		.handler(async function({ input, ctx }) {
			const loggedInUserId = ctx.user.id;
			const { calComApiKey } = input;

			// 1. Initialize the service with the key and validate it by fetching the user
			const calService = new CalComService(calComApiKey);
			let calComUser: CalComUser;
			try {
				calComUser = await calService.getUser();
			} catch (error) {
				throw new Error('Invalid Cal.com API key.');
			}

			// 2. Fetch the user's default schedule
			const defaultSchedule = await calService.getDefaultSchedule();
			if (!defaultSchedule) {
				throw new Error('No schedules found in your Cal.com account. Please create one first.');
			}

			// 3. Check if a recruiter profile already exists for this user
			const [existingProfile] = await db
				.select()
				.from(recruiterProfiles)
				.where(eq(recruiterProfiles.userId, loggedInUserId))
				.limit(1);

			// 4. Create or update the recruiter profile in our database
			if (!existingProfile) {
				await db.insert(recruiterProfiles).values({
					id: `rec_${nanoid()}`,
					userId: loggedInUserId,
					organizationName: 'Default Organization', // User can update this later
					recruitingFor: 'Default Role', // User can update this later
					calComUsername: calComUser.username,
					calComConnected: true,
					calComApiKey: calComApiKey, // In production, this should be encrypted
					calComUserId: calComUser.id,
					calComScheduleId: defaultSchedule.id,
					timezone: calComUser.timeZone,
				});
			} else {
				await db
					.update(recruiterProfiles)
					.set({
						calComUsername: calComUser.username,
						calComConnected: true,
						calComApiKey: calComApiKey,
						calComUserId: calComUser.id,
						calComScheduleId: defaultSchedule.id,
						timezone: calComUser.timeZone,
						updatedAt: new Date(),
					})
					.where(eq(recruiterProfiles.userId, loggedInUserId));
			}

			return { success: true, message: `Successfully connected Cal.com account for ${calComUser.username}.` };
		}),

	/**
	 * Sets up a standard 45-minute "Candidate Interview" event type
	 * in the recruiter's connected Cal.com account.
	 */
	setupInterviewEvent: protectedBase
		.handler(async function({ ctx }) {
			const loggedInUserId = ctx.user.id;

			// 1. Get the recruiter's profile from our database
			const [recruiter] = await db
				.select()
				.from(recruiterProfiles)
				.where(eq(recruiterProfiles.userId, loggedInUserId))
				.limit(1);

			if (!recruiter || !recruiter.calComApiKey || !recruiter.calComScheduleId) {
				throw new Error('Your Cal.com account is not connected or configured properly.');
			}

			// 2. Initialize the service with the recruiter's stored API key
			const calService = new CalComService(recruiter.calComApiKey);

			// 3. Create the event type using the service's utility method
			const newEventType = await calService.setupInterviewEventType(recruiter.calComScheduleId);

			// 4. Update our database with the new event type ID
			await db
				.update(recruiterProfiles)
				.set({ calComEventTypeId: newEventType.id })
				.where(eq(recruiterProfiles.userId, loggedInUserId));

			return { success: true, eventTypeId: newEventType.id };
		}),

	/**
	 * Fetches available time slots for a specific recruiter's event type.
	 */
	getAvailableSlots: protectedBase
		.input(z.object({
			recruiterId: z.string(),
			startTime: z.string().datetime(),
			endTime: z.string().datetime(),
		}))
		.handler(async function({ input }) {
			const [recruiter] = await db.select().from(recruiterProfiles).where(eq(recruiterProfiles.id, input.recruiterId)).limit(1);
			if (!recruiter || !recruiter.calComApiKey || !recruiter.calComEventTypeId) {
				throw new Error('Recruiter is not configured for scheduling.');
			}
			const calService = new CalComService(recruiter.calComApiKey);
			return calService.getAvailableSlots({
				eventTypeId: recruiter.calComEventTypeId,
				startTime: input.startTime,
				endTime: input.endTime,
			});
		}),

	/**
	 * Creates a new booking (schedules an interview).
	 */
	createBooking: protectedBase
		.input(z.object({
			recruiterId: z.string(),
			start: z.string().datetime(),
			end: z.string().datetime(),
			timeZone: z.string(),
			candidateName: z.string(),
			candidateEmail: z.string().email(),
		}))
		.handler(async function({ input, ctx }) {
			const candidate = ctx.user;
			const [recruiter] = await db.select().from(recruiterProfiles).where(eq(recruiterProfiles.id, input.recruiterId)).limit(1);
			if (!recruiter || !recruiter.calComApiKey || !recruiter.calComEventTypeId) {
				throw new Error('Recruiter is not configured for scheduling.');
			}
			const calService = new CalComService(recruiter.calComApiKey);
			const booking = await calService.createBooking({
				eventTypeId: recruiter.calComEventTypeId,
				start: input.start,
				end: input.end,
				timeZone: input.timeZone,
				responses: { name: input.candidateName, email: input.candidateEmail },
				metadata: { candidateId: candidate.id },
			});

			return booking;
		}),
};