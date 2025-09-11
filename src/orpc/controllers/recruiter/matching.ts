// src/orpc/controllers/recruiter/matching.ts

import { z } from 'zod'

import { protectedBase } from '~/orpc/middleware/bases'
import { candidateMatchingService } from '~/services/candidate-matching'
import { jobPostingService } from '~/services/job-posting'
import type { JobPosting } from '~/types/internal/jobs'

export const matching = {
	/**
	 * Finds and ranks candidates who match a specific job posting.
	 */
	findMatches: protectedBase
		.input(
			z.object({
				jobPostingId: z.string().min(1, 'Job Posting ID is required'),
				// Optional filters and pagination
				minMatchScore: z.number().optional(),
				page: z.number().optional(),
				limit: z.number().optional(),
			}),
		)
		.handler(async function ({ input, context }) {
			// Step 1: Validate authentication
			if (!context.auth.user.id) {
				throw new Error('User not authenticated')
			}

			// Step 2: Get the full job posting details
			type JobPostingResponse = {
				success: boolean
				data?: {
					job: JobPosting
				}
				error?: string
			}

			const jobPostingResponse = (await jobPostingService.getJobPosting(
				input.jobPostingId,
			)) as JobPostingResponse

			if (!jobPostingResponse.success || !jobPostingResponse.data) {
				throw new Error(
					jobPostingResponse.error
						|| 'Job posting not found or you do not have permission to view it.',
				)
			}

			const jobPosting = jobPostingResponse.data.job

			// Step 2: Prepare filters and pagination options for the matching service
			// Step 3: Call the candidate matching service with the full job posting object and candidates
			const matches = candidateMatchingService.findMatchingCandidates([], jobPosting)

			// Step 4: Return the paginated list of matched candidates
			return matches
		}),
}
