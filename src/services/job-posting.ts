import { eq } from 'drizzle-orm'

import { db } from '~/db'
import { jobPostings, recruiterProfiles } from '~/db/models'
import { generateId } from '~/lib/utils' // We will create this later
import type { ExperienceLevel, ExtractedSkill, JobAnalysisResult, Skill } from '~/types/public'

import { jobAnalysisService } from './job-analysis'

interface CreateJobPostingInput {
	title: string
	description: string
	experienceLevel?: string
	salaryMin?: number
	salaryMax?: number
	location?: string
	remoteAllowed?: boolean
	employmentType?: string
}

interface JobPostingResponse {
	success: boolean
	data?: {
		job: typeof jobPostings.$inferSelect
		analysis: JobAnalysisResult
	}
	error?: string
}

export class JobPostingService {
	async createJobPosting(
		recruiterId: string,
		data: CreateJobPostingInput,
	): Promise<JobPostingResponse> {
		try {
			// Validate that the recruiter exists
			const [recruiter] = await db
				.select()
				.from(recruiterProfiles)
				.where(eq(recruiterProfiles.id, recruiterId))
				.limit(1)

			if (recruiter === undefined) {
				return {
					success: false,
					error: 'Recruiter not found',
				}
			}

			const analysis = await jobAnalysisService.analyzeJobPosting(data.description, data.title)

			const jobId = generateId()

			const jobData = {
				id: jobId,
				recruiterId,
				title: data.title,
				rawDescription: data.description,
				extractedSkills: analysis.extractedSkills,
				requiredSkills: analysis.requiredSkills,
				preferredSkills: analysis.preferredSkills,
				experienceLevel: data.experienceLevel || analysis.experienceLevel,
				salaryMin: data.salaryMin || analysis.salaryRange?.min,
				salaryMax: data.salaryMax || analysis.salaryRange?.max,
				location: data.location || null,
				remoteAllowed: data.remoteAllowed || false,
				employmentType: data.employmentType || 'full-time',
				status: 'active',
				aiConfidenceScore: analysis.confidence.toFixed(2),
			}

			const [createdJob] = await db.insert(jobPostings).values(jobData).returning()
			return {
				success: true,
				data: {
					job: createdJob,
					analysis,
				},
			}
		} catch (error) {
			console.error('Error creating job posting:', error)
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to create job posting',
			}
		}
	}

	async getJobPosting(jobId: string): Promise<JobPostingResponse> {
		try {
			const [job] = await db.select().from(jobPostings).where(eq(jobPostings.id, jobId)).limit(1)

			if (!job) {
				return {
					success: false,
					error: 'Job posting not found',
				}
			}

			// Recreate the analysis result from the job data
			const analysis: JobAnalysisResult = {
				extractedSkills: job.extractedSkills as ExtractedSkill[],
				requiredSkills: job.requiredSkills as Skill[],
				preferredSkills: job.preferredSkills as Skill[],
				experienceLevel: job.experienceLevel as ExperienceLevel,
				keyTerms: [], //this to
				salaryRange: {
					min: job.salaryMin || 0,
					max: job.salaryMax || 0,
				},
				confidence: parseFloat(job.aiConfidenceScore || '0'),
			}

			return {
				success: true,
				data: {
					job,
					analysis,
				},
			}
		} catch (error) {
			console.error('Error getting job posting:', error)
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to get job posting',
			}
		}
	}
}

export const jobPostingService = new JobPostingService()
