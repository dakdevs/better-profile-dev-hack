// src/types/interview-management.ts

// --- Core Types ---
export type SkillCategory = 'technical' | 'soft' | 'domain' | 'language' | 'certification';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive' | 'intern';
export type OverallFit = 'excellent' | 'good' | 'fair' | 'poor';
export type JobPostingStatus = 'active' | 'paused' | 'closed' | 'draft';

// --- Skill & Analysis Interfaces ---
export interface Skill {
	name: string;
	required?: boolean;
	category?: SkillCategory;
	proficiencyScore?: number;
}

export interface ExtractedSkill {
	name: string;
	confidence: number;
	category: SkillCategory;
	synonyms?: string[];
	context?: string;
}

export interface JobAnalysisResult {
	extractedSkills: ExtractedSkill[];
	requiredSkills: Skill[];
	preferredSkills: Skill[];
	experienceLevel?: ExperienceLevel;
	salaryRange?: { min?: number; max?: number; };
	keyTerms: string[];
	confidence: number;
	summary?: string;
}

// --- Job Posting Interfaces ---
export interface JobPosting {
	id: string;
	recruiterId: string;
	title: string;
	rawDescription: string;
	extractedSkills: ExtractedSkill[];
	requiredSkills: Skill[];
	preferredSkills: Skill[];
	experienceLevel?: ExperienceLevel;
	salaryMin?: number;
	salaryMax?: number;
	location?: string | null;
	remoteAllowed: boolean;
	employmentType: string;
	status: JobPostingStatus;
	aiConfidenceScore?: number;
	createdAt: Date;
	updatedAt: Date;
}

// --- Candidate & Matching Interfaces (New) ---
export interface Candidate {
	id: string;
	name: string;
	email: string;
}

export interface CandidateWithSkills extends Candidate {
	skills: Skill[];
}

export interface MatchDetails {
	score: number;
	matchingSkills: Skill[];
	skillGaps: Skill[];
	overallFit: OverallFit;
	availability: any[]; // Placeholder for now
}

export interface CandidateWithMatch {
	candidate: CandidateWithSkills;
	match: MatchDetails;
}

export interface CandidateJobMatch {
	id: string;
	jobPostingId: string;
	candidateId: string;
	matchScore: number;
	matchingSkills: Skill[];
	skillGaps: Skill[];
	overallFit: OverallFit;
	createdAt: Date;
	updatedAt: Date;
}

export interface CandidateFilters {
	skills?: string[];
	minMatchScore?: number;
}