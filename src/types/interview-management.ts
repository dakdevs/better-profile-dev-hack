// src/types/interview-management.ts

// Defines the categories for skills
export type SkillCategory = 'technical' | 'soft' | 'domain' | 'language' | 'certification';

// Defines the possible experience levels for a job
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive' | 'intern';

// Represents a basic skill with its requirements
export interface Skill {
	name: string;
	required: boolean;
	category: SkillCategory;
}

// Represents a skill extracted by the AI, with more detail
export interface ExtractedSkill {
	name: string;
	confidence: number;
	category: SkillCategory;
	synonyms?: string[];
	context?: string;
}

// Defines the complete structure of the AI's analysis result
export interface JobAnalysisResult {
	extractedSkills: ExtractedSkill[];
	requiredSkills: Skill[];
	preferredSkills: Skill[];
	experienceLevel?: ExperienceLevel;
	salaryRange?: {
		min?: number;
		max?: number;
	};
	keyTerms: string[];
	confidence: number;
	summary?: string;
}