// src/services/candidate-matching.ts
import { db } from '~/db';
import { userSkills, users, jobPostings, candidateJobMatches } from '~/db/models';
import { eq, and, sql, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';
// Note: We will create the files for these missing imports in the next step.
// import {
//   CandidateWithMatch,
//   CandidateFilters,
//   Skill,
//   OverallFit,
//   JobPosting,
//   CandidateJobMatch
// } from '~/types/interview-management';

// --- Placeholder Types (to be replaced) ---
type JobPosting = any;
type CandidateWithSkills = any;
type Skill = any;
type SkillMatchResult = any;
type OverallFit = 'excellent' | 'good' | 'fair' | 'poor';
type CandidateWithMatch = any;
type CandidateJobMatch = any;

export class CandidateMatchingService {
	/**
	 * Calculate match score and details for a specific candidate and job
	 */
	async calculateCandidateMatch(
		candidate: CandidateWithSkills,
		jobPosting: JobPosting
	): Promise<CandidateWithMatch> {
		const requiredSkills = (jobPosting.requiredSkills as Skill[]) || [];
		const preferredSkills = (jobPosting.preferredSkills as Skill[]) || [];

		// Calculate skill matches
		const matchResult = this.calculateSkillMatch(
			candidate.skills,
			requiredSkills,
			preferredSkills
		);

		const result = {
			candidate,
			match: {
				score: matchResult.matchScore,
				matchingSkills: matchResult.matchingSkills,
				skillGaps: matchResult.skillGaps,
				overallFit: matchResult.overallFit,
				availability: [], // Placeholder
			},
		};

		// We can add caching back later
		// await cache.set(cacheKey, result, cacheTTL.medium);
		return result;
	}

	/**
	 * Calculate skill-based matching between candidate and job requirements
	 */
	private calculateSkillMatch(
		candidateSkills: Skill[],
		requiredSkills: Skill[],
		preferredSkills: Skill[]
	): SkillMatchResult {
		const candidateSkillMap = new Map(
			candidateSkills.map(skill => [skill.name.toLowerCase().trim(), skill])
		);

		const findSkillMatch = (jobSkill: Skill): Skill | null => {
			const jobSkillName = jobSkill.name.toLowerCase().trim();
			if (candidateSkillMap.has(jobSkillName)) {
				return candidateSkillMap.get(jobSkillName)!;
			}
			// Simplified fuzzy matching for now
			for (const [candidateSkillName, candidateSkill] of candidateSkillMap) {
				if (candidateSkillName.includes(jobSkillName) || jobSkillName.includes(candidateSkillName)) {
					return candidateSkill;
				}
			}
			return null;
		};

		const matchingRequired = requiredSkills.filter(findSkillMatch);
		const matchingPreferred = preferredSkills.filter(findSkillMatch);
		const skillGaps = requiredSkills.filter(skill => !findSkillMatch(skill));

		const requiredScore = requiredSkills.length > 0
			? (matchingRequired.length / requiredSkills.length) * 100
			: 100;

		const preferredScore = preferredSkills.length > 0
			? (matchingPreferred.length / preferredSkills.length) * 100
			: 0;

		// Simplified scoring for now, can add proficiency weighting back later
		const finalScore = Math.round((requiredScore * 0.7) + (preferredScore * 0.3));

		return {
			matchingSkills: [...matchingRequired, ...matchingPreferred],
			skillGaps,
			matchScore: Math.min(100, Math.max(0, finalScore)),
			overallFit: this.determineOverallFit(finalScore),
		};
	}

	/**
	 * Determine overall fit category based on match score
	 */
	private determineOverallFit(matchScore: number): OverallFit {
		if (matchScore >= 80) return 'excellent';
		if (matchScore >= 60) return 'good';
		if (matchScore >= 40) return 'fair';
		return 'poor';
	}

	// --- Other methods from the original file can be added back one by one ---
	// For now, the core `calculateCandidateMatch` is the most important.
}

// Export singleton instance
export const candidateMatchingService = new CandidateMatchingService();