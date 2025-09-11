// src/types/internal/jobs.ts

import type { ExperienceLevel, ExtractedSkill, Skill } from './skills'

// --- Job Posting Interfaces ---
export interface JobPosting {
	id: string
	recruiterId: string
	title: string
	rawDescription: string
	extractedSkills: ExtractedSkill[]
	requiredSkills: Skill[]
	preferredSkills: Skill[]
	experienceLevel?: ExperienceLevel
	salaryMin?: number
	salaryMax?: number
	location?: string | null
	remoteAllowed: boolean
	employmentType: string
}
