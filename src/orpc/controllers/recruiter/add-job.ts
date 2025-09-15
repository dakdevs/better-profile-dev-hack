import z from 'zod'

import { db } from '~/db'
import { jobPostings } from '~/db/models/jobs'
import { protectedBase } from '~/orpc/middleware/bases'
import parseJob from '~/services/parse-job'

export default protectedBase
	.errors({
		FAILED_TO_PARSE_JOB: {
			status: 400,
			message: 'Failed to parse job',
		},
	})
	.input(
		z.discriminatedUnion('type', [
			z.object({
				type: z.literal('url'),
				jobUrl: z.url('Job URL is required'),
			}),
			z.object({
				type: z.literal('description'),
				jobTitle: z.string().min(1, 'Job title is required'),
				jobDescription: z.string().min(1, 'Job description is required'),
			}),
		]),
	)
	.handler(async ({ input, errors, context }) => {
		const parsed = await parseJob(input)

		if (!parsed) {
			throw errors.FAILED_TO_PARSE_JOB()
		}

		await db.insert(jobPostings).values({
			userId: context.auth.user.id,
			rawDescription: parsed.jobDescription,
			title: parsed.jobTitle || '',
			experienceLevel: parsed.result.experienceLevel,
			extractedSkills: parsed.result.extractedSkills,
			preferredSkills: parsed.result.preferredSkills,
			salaryMin: String(parsed.result.salaryRange?.min) || null,
			salaryMax: String(parsed.result.salaryRange?.max) || null,
			requiredSkills: parsed.result.requiredSkills,
		})
	})
