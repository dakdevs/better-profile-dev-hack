// src/types/interview-management.ts
// This file re-exports all types from internal for external use

// Import and re-export all types from internal module
export type {
	// Skills
	Skill,
	SkillCategory,
	ExtractedSkill,
	ExperienceLevel,
	OverallFit,
	JobPostingStatus,
	JobAnalysisResult,

	// Jobs
	JobPosting,

	// Candidates
	Candidate,
	CandidateWithSkills,
	MatchDetails,
	CandidateWithMatch,
	CandidateJobMatch,
	CandidateFilters,
} from './internal'
