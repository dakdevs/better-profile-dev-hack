// src/services/candidate-matching.ts
import type {
	CandidateWithMatch,
	CandidateWithSkills,
	MatchDetails,
} from '~/types/internal/candidates'
import type { JobPosting } from '~/types/internal/jobs'
import type { OverallFit, Skill } from '~/types/public'

interface SkillMatchResult extends MatchDetails {
	matchScore: number
}

export class CandidateMatchingService {
	/**
	 * Calculate match score and details for a specific candidate and job
	 */
	calculateCandidateMatch(
		candidate: CandidateWithSkills,
		jobPosting: JobPosting,
	): CandidateWithMatch {
		// @ts-expect-error - Default values for potentially undefined arrays
		const requiredSkills: Skill[] = jobPosting.requiredSkills ?? []
		const preferredSkills: Skill[] = jobPosting.preferredSkills ?? []

		// Calculate skill matches
		const matchResult = this.calculateSkillMatch(candidate.skills, requiredSkills, preferredSkills)

		return {
			candidate,
			match: {
				score: matchResult.matchScore,
				matchingSkills: matchResult.matchingSkills,
				skillGaps: matchResult.skillGaps,
				overallFit: matchResult.overallFit,
				availability: [], // Placeholder
			},
		}

		// Nothing to return here - this code is now unreachable
	}

	/**
	 * Calculate skill-based matching between candidate and job requirements
	 */
	private calculateSkillMatch(
		candidateSkills: Skill[],
		requiredSkills: Skill[],
		preferredSkills: Skill[],
	): SkillMatchResult {
		const candidateSkillMap = new Map(
			candidateSkills.map((skill) => [skill.name.toLowerCase().trim(), skill]),
		)

		const findSkillMatch = (jobSkill: Skill): Skill | null => {
			const jobSkillName = jobSkill.name.toLowerCase().trim()
			const skill = candidateSkillMap.get(jobSkillName)
			if (skill) {
				return skill
			}
			// Simplified fuzzy matching for now
			for (const [candidateSkillName, candidateSkill] of candidateSkillMap) {
				if (
					candidateSkillName.includes(jobSkillName)
					|| jobSkillName.includes(candidateSkillName)
				) {
					return candidateSkill
				}
			}
			return null
		}

		const matchingRequired = requiredSkills.filter(findSkillMatch)
		const matchingPreferred = preferredSkills.filter(findSkillMatch)
		const skillGaps = requiredSkills.filter((skill) => !findSkillMatch(skill))

		const requiredScore =
			requiredSkills.length > 0 ? (matchingRequired.length / requiredSkills.length) * 100 : 100

		const preferredScore =
			preferredSkills.length > 0 ? (matchingPreferred.length / preferredSkills.length) * 100 : 0

		// Simplified scoring for now, can add proficiency weighting back later
		const finalScore = Math.round(requiredScore * 0.7 + preferredScore * 0.3)

		return {
			matchingSkills: [...matchingRequired, ...matchingPreferred],
			score: finalScore,
			matchScore: Math.min(100, Math.max(0, finalScore)),
			skillGaps,
			overallFit: this.determineOverallFit(finalScore),
			availability: [], // To be implemented later
		}
	}

	/**
	 * Determine overall fit category based on match score
	 */
	private determineOverallFit(matchScore: number): OverallFit {
		if (matchScore >= 80) return 'excellent'
		if (matchScore >= 60) return 'good'
		if (matchScore >= 40) return 'fair'
		return 'poor'
	}

	/**
	 * Find matching candidates for a job posting with their respective match scores
	 */
	findMatchingCandidates(
		candidates: CandidateWithSkills[],
		jobPosting: JobPosting,
	): CandidateWithMatch[] {
		const matches = candidates.map((candidate) =>
			this.calculateCandidateMatch(candidate, jobPosting),
		)

		// Sort by match score in descending order
		return matches.sort((a, b) => (b.match.score || 0) - (a.match.score || 0))
	}
}

// Export singleton instance
export const candidateMatchingService = new CandidateMatchingService()
