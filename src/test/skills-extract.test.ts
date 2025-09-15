import { describe, it, expect, beforeAll, skip } from 'vitest'

import { db } from '~/db'
import { eq } from 'drizzle-orm'
import { users } from '~/db/models'
import { userSkills } from '~/db/models/user-skills'
import { saveExtractedSkillsForUser, type ExtractedSkill } from '~/services/skills-extract'

let testUserId: string | null = null

beforeAll(async () => {
	const found = await db
		.select({ id: users.id })
		.from(users)
		.limit(1)

	testUserId = found.length > 0 ? found[0].id : null
})

describe('skills extract persistence', () => {
	it('upserts mock extracted skills into user_skills', async () => {
		if (!testUserId) return skip('No users in DB; add a user to run this test')

		const mockSkills: ExtractedSkill[] = [
			{ name: 'TypeScript', category: 'technical', confidence: 0.92 },
			{ name: 'React', category: 'technical', confidence: 0.85 },
			{ name: 'PostgreSQL', category: 'database', confidence: 0.8 },
		]

		await saveExtractedSkillsForUser(testUserId, mockSkills)

		const rows = await db
			.select({ userId: userSkills.userId, skillName: userSkills.skillName })
			.from(userSkills)
			.where(eq(userSkills.userId, testUserId))

		const skillNames = rows.map((r) => r.skillName.toLowerCase())
		expect(skillNames).toContain('typescript')
		expect(skillNames).toContain('react')
		expect(skillNames).toContain('postgresql')
	})
})


