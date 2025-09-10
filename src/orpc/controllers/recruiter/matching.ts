import { z } from 'zod';
import { protectedBase } from '~/orpc/middleware/bases';
import { candidateMatchingService } from '~/services/candidate-matching';
import { jobPostingService } from '~/services/job-posting';

export const matching = {
	/**
	 * Finds and ranks candidates who match a specific job posting.
	 */
	findMatches: protectedBase
		.input(z.object({
			jobPostingId: z.string().min(1, 'Job Posting ID is required'),
			// Optional filters and pagination
			minMatchScore: z.number().optional(),
			page: z.number().optional(),
			limit: z.number().optional(),
		}))
		.handler(async function({ input, ctx }) {
			// Step 1: Get the full job posting details. The matching service needs this
			// to know which skills to match against. We also pass the recruiter's user ID
			// to ensure they have permission to access this job.
			const jobPostingResponse = await jobPostingService.getJobPosting(input.jobPostingId, ctx.user.id);

			if (!jobPostingResponse.success || !jobPostingResponse.data) {
				throw new Error(jobPostingResponse.error || 'Job posting not found or you do not have permission to view it.');
			}

			const jobPosting = jobPostingResponse.data;

			// Step 2: Prepare filters and pagination options for the matching service
			const filters = {
				minMatchScore: input.minMatchScore,
			};
			const pagination = {
				page: input.page,
				limit: input.limit,
			};

			// Step 3: Call the candidate matching service with the full job posting object
			const matches = await candidateMatchingService.findMatchingCandidates(
				jobPosting,
				filters,
				pagination
			);

			// Step 4: Return the paginated list of matched candidates
			return matches;
		}),
};