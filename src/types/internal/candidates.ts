// src/types/internal/candidates.ts

import type { OverallFit, Skill } from './skills'

export interface Candidate {
	id: string
	name: string
	email: string
}

export interface CandidateWithSkills extends Candidate {
	skills: Skill[]
}

export interface MatchDetails {
	score: number
	matchingSkills: Skill[]
	skillGaps: Skill[]
	overallFit: OverallFit
	availability: Array<unknown> // Placeholder for now
}

export interface CandidateWithMatch {
	candidate: CandidateWithSkills
	match: MatchDetails
}

export interface CandidateJobMatch {
	id: string
	jobPostingId: string
	candidateId: string
	matchScore: number
	matchingSkills: Skill[]
	skillGaps: Skill[]
	overallFit: OverallFit
	createdAt: Date
	updatedAt: Date
}

export interface CandidateFilters {
	skills?: string[]
	minMatchScore?: number
}
