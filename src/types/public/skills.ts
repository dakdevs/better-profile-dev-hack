// src/types/public/skills.ts

/**
 * Categories of skills that can be tracked in the system
 */
export type SkillCategory = 'technical' | 'soft' | 'domain' | 'language' | 'certification'

/**
 * Experience levels for job positions
 */
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive' | 'intern'

/**
 * Overall fit assessment for job matches
 */
export type OverallFit = 'excellent' | 'good' | 'fair' | 'poor'

/**
 * Status of a job posting
 */
export type JobPostingStatus = 'active' | 'paused' | 'closed' | 'draft'

/**
 * A skill with associated metadata
 */
export interface Skill {
	name: string
	required?: boolean
	category?: SkillCategory
	proficiencyScore?: number
}

/**
 * A skill extracted from text with confidence and metadata
 */
export interface ExtractedSkill {
	name: string
	confidence: number
	category: SkillCategory
	synonyms?: string[]
	context?: string
}

/**
 * Results of analyzing a job posting for skills and requirements
 */
export interface JobAnalysisResult {
	extractedSkills: ExtractedSkill[]
	requiredSkills: Skill[]
	preferredSkills: Skill[]
	experienceLevel?: ExperienceLevel
	salaryRange?: { min?: number; max?: number }
	keyTerms: string[]
	confidence: number
	summary?: string
}
