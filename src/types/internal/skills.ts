// src/types/internal/skills.ts

// --- Core Types ---
export type SkillCategory = 'technical' | 'soft' | 'domain' | 'language' | 'certification'
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive' | 'intern'
export type OverallFit = 'excellent' | 'good' | 'fair' | 'poor'
export type JobPostingStatus = 'active' | 'paused' | 'closed' | 'draft'

// --- Skill & Analysis Interfaces ---
export interface Skill {
	name: string
	required?: boolean
	category?: SkillCategory
	proficiencyScore?: number
}

export interface ExtractedSkill {
	name: string
	confidence: number
	category: SkillCategory
	synonyms?: string[]
	context?: string
}

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
