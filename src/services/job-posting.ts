import { eq } from 'drizzle-orm';
import { db } from '~/db';
import { jobPostings, recruiterProfiles } from '~/db/models';
import { jobAnalysisService } from './job-analysis';
import { generateId } from '~/lib/utils'; // We will create this later



export class JobPostingService {
	async createJobPosting(recruiterId: string, data: any): Promise<any> {
		try {
			const recruiter = await db
				.select()
				.from(recruiterProfiles)
				.where(eq(recruiterProfiles.id, recruiterId))
				.limit(1);

			if (!recruiter) {
				return { success: false, error: 'Recruiter profile not found' };
			}

			const analysis = await jobAnalysisService.analyzeJobPosting(data.description, data.title);

			const jobId = generateId();

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
			};

			const [createdJob] = await db.insert(jobPostings).values(jobData).returning();

			if (!createdJob) {
				return { success: false, error: 'Failed to create job posting in database' };
			}

			return {
				success: true,
				data: {
					job: createdJob,
					analysis,
				},
			};
		} catch (error) {
			console.error('Error creating job posting:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to create job posting',
			};
		}
	}
}

export const jobPostingService = new JobPostingService();