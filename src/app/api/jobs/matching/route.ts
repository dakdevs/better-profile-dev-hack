import { NextRequest, NextResponse } from 'next/server'
import { eq, sql } from 'drizzle-orm'

import { db } from '~/db'
import { jobPostings, users } from '~/db/models'
import { userSkills } from '~/db/models/user-skills'

// Inlined minimal candidate matching logic (adapted from platform service)
type Skill = { name: string; proficiencyScore?: number; category?: string }
type JobPosting = {
	id: string
	requiredSkills?: Skill[]
	preferredSkills?: Skill[]
}

type CandidateWithSkills = {
	id: string
	name: string
	email: string
	skills: Skill[]
}

type CandidateWithMatch = {
	candidate: CandidateWithSkills
	match: {
		score: number
		matchingSkills: Skill[]
		skillGaps: Skill[]
		overallFit: 'excellent' | 'good' | 'fair' | 'poor'
		availability: string[]
	}
}

function determineOverallFit(matchScore: number): 'excellent' | 'good' | 'fair' | 'poor' {
	if (matchScore >= 80) return 'excellent'
	if (matchScore >= 60) return 'good'
	if (matchScore >= 40) return 'fair'

	return 'poor'
}

function areSkillsSimilar(skill1: string, skill2: string): boolean {
	const s1 = skill1.toLowerCase().trim()
	const s2 = skill2.toLowerCase().trim()
	if (s1 === s2) return true
	const synonyms: Record<string, string[]> = {
		javascript: ['js', 'ecmascript', 'es6', 'es2015', 'es2020'],
		typescript: ['ts'],
		react: ['reactjs', 'react.js'],
		node: ['nodejs', 'node.js'],
		postgresql: ['postgres', 'psql'],
		kubernetes: ['k8s'],
	}
	for (const [base, vars] of Object.entries(synonyms)) {
		if (
			(s1 === base && vars.includes(s2))
			|| (s2 === base && vars.includes(s1))
			|| (vars.includes(s1) && vars.includes(s2))
		)
			return true
	}
	if (s1.includes(s2) || s2.includes(s1)) return true

	return false
}

function calculateSkillMatch(
	candidateSkills: Skill[],
	requiredSkills: Skill[],
	preferredSkills: Skill[],
) {
	const findMatch = (jobSkill: Skill): Skill | null => {
		const found = candidateSkills.find((cs) => cs.name && areSkillsSimilar(cs.name, jobSkill.name))

		return found || null
	}

	const matchingRequired: Skill[] = []
	const matchingRequiredCandidateSkills: Skill[] = []
	for (const rs of requiredSkills) {
		const cs = findMatch(rs)
		if (cs) {
			matchingRequired.push(rs)
			matchingRequiredCandidateSkills.push(cs)
		}
	}
	const matchingPreferred: Skill[] = []
	const matchingPreferredCandidateSkills: Skill[] = []
	for (const ps of preferredSkills) {
		const cs = findMatch(ps)
		if (cs) {
			matchingPreferred.push(ps)
			matchingPreferredCandidateSkills.push(cs)
		}
	}
	const skillGaps = requiredSkills.filter((s) => !findMatch(s))

	const requiredScore =
		requiredSkills.length > 0 ? (matchingRequired.length / requiredSkills.length) * 100 : 100
	const preferredScore =
		preferredSkills.length > 0 ? (matchingPreferred.length / preferredSkills.length) * 100 : 0

	const prof = (arr: Skill[]) => {
		if (arr.length === 0) return 1
		const avg = arr.reduce((a, b) => a + (b.proficiencyScore ?? 50), 0) / arr.length

		return 0.7 + (avg / 100) * 0.6
	}
	const weightedRequired = requiredScore * prof(matchingRequiredCandidateSkills)
	const weightedPreferred = preferredScore * prof(matchingPreferredCandidateSkills)
	const finalScore = Math.round(weightedRequired * 0.7 + weightedPreferred * 0.3)

	return {
		matchingSkills: [...matchingRequired, ...matchingPreferred],
		skillGaps,
		matchScore: Math.min(100, Math.max(0, finalScore)),
		overallFit: determineOverallFit(finalScore),
	}
}

async function getCandidatesWithSkillsPaginated(limit: number): Promise<CandidateWithSkills[]> {
	const rows = await db
		.select({
			userId: users.id,
			userName: users.name,
			userEmail: users.email,
			skillName: userSkills.skillName,
			proficiencyScore: userSkills.proficiencyScore,
		})
		.from(users)
		.innerJoin(userSkills, sql`${users.id}::text = ${userSkills.userId}`)
		.limit(limit)

	const map = new Map<string, CandidateWithSkills>()
	for (const r of rows) {
		let c = map.get(r.userId)
		if (!c) {
			c = { id: r.userId, name: r.userName, email: r.userEmail, skills: [] }
			map.set(r.userId, c)
		}
		c.skills.push({
			name: r.skillName,
			proficiencyScore: parseFloat(r.proficiencyScore as unknown as string),
			category: 'technical',
		})
	}

	return Array.from(map.values())
}

function toArray<T>(val: T[] | undefined): T[] {
	return Array.isArray(val) ? val : []
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function toSkills(val: unknown): Skill[] {
	if (!Array.isArray(val)) return []
	const result: Skill[] = []
	for (const item of val) {
		if (isRecord(item) && typeof item.name === 'string') {
			const proficiencyScore =
				typeof item.proficiencyScore === 'number' ? item.proficiencyScore : undefined
			const category = typeof item.category === 'string' ? item.category : undefined

			result.push({ name: item.name, proficiencyScore, category })
		}
	}

	return result
}

async function findMatchingCandidates(
	jobPosting: JobPosting,
	minMatchScore = 10,
	limit = 1,
): Promise<{ data: CandidateWithMatch[] }> {
	const candidates = await getCandidatesWithSkillsPaginated(100)
	const matches: CandidateWithMatch[] = candidates.map((c) => {
		const required = toArray(jobPosting.requiredSkills)
		const preferred = toArray(jobPosting.preferredSkills)
		const result = calculateSkillMatch(c.skills, required, preferred)

		return {
			candidate: c,
			match: {
				score: result.matchScore,
				matchingSkills: result.matchingSkills,
				skillGaps: result.skillGaps,
				overallFit: result.overallFit,
				availability: [],
			},
		}
	})
	const filtered = matches
		.filter((m) => m.match.score >= minMatchScore)
		.sort((a, b) => b.match.score - a.match.score)

	return { data: filtered.slice(0, limit) }
}

// POST /api/jobs/matching - Get candidates matching a job posting
// Input: { jobID: string }
// Output: { candidateID: string }
export async function POST(req: NextRequest) {
	try {
		const raw: unknown = await req.json()
		const body = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>
		const jobID = typeof body.jobID === 'string' ? body.jobID : undefined

		if (!jobID) {
			return NextResponse.json(
				{ error: 'jobID parameter is required and must be a string' },
				{ status: 400 },
			)
		}

		const job = await db
			.select({
				id: jobPostings.id,
				title: jobPostings.title,
				requiredSkills: jobPostings.requiredSkills,
				preferredSkills: jobPostings.preferredSkills,
				rawDescription: jobPostings.rawDescription,
				experienceLevel: jobPostings.experienceLevel,
				salaryMin: jobPostings.salaryMin,
				salaryMax: jobPostings.salaryMax,
				createdAt: jobPostings.createdAt,
				updatedAt: jobPostings.updatedAt,
			})
			.from(jobPostings)
			.where(eq(jobPostings.id, jobID))
			.limit(1)

		if (job.length === 0) {
			return NextResponse.json({ error: 'Job not found' }, { status: 404 })
		}

		const jobData = job[0]
		const jobPostingInput: JobPosting = {
			id: jobData.id,
			requiredSkills: toSkills(jobData.requiredSkills),
			preferredSkills: toSkills(jobData.preferredSkills),
		}

		const matchesResult = await findMatchingCandidates(jobPostingInput, 10, 1)

		if (matchesResult.data.length === 0) {
			const candidateWithSkills = await db
				.select({
					userId: users.id,
					userName: users.name,
					userEmail: users.email,
				})
				.from(users)
				.innerJoin(userSkills, sql`${users.id}::text = ${userSkills.userId}`)
				.limit(1)

			if (candidateWithSkills.length === 0) {
				return NextResponse.json(
					{
						error: 'No candidates found in database',
					},
					{ status: 404 },
				)
			}

			const candidateID = candidateWithSkills[0].userId

			return NextResponse.json({ candidateID })
		}

		const topCandidate = matchesResult.data[0]
		const candidateID = topCandidate.candidate.id

		return NextResponse.json({ candidateID })
	} catch (error) {
		console.error('jobs/matching route error', error)

		return NextResponse.json({ error: 'Failed to find matching candidates' }, { status: 500 })
	}
}
