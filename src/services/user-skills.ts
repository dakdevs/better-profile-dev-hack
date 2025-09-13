// src/services/user-skills.ts

import { db } from '~/db'
import { userSkills, skillMentions } from '~/db/models/skills'
import { eq } from 'drizzle-orm'

/**
 * Service for managing user skills and skill mentions
 */
export class UserSkillsService {
	/**
	 * Upsert user skill (create or update aggregated skill data)
	 */

	// TODO: USE AFTER
	async upsertUserSkill(
		userId: string, 
		skillName: string, 
		confidence: number, 
		engagementLevel: string, 
		topicDepth: number
	): Promise<string> {
		const norm = skillName.trim()
		const userSkillId = `${userId}_${norm.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '')}`

		console.log(`🔎 upsertUserSkill called for user "${userId}" skill "${norm}"`)

		try {
			// Check if user already has this skill
			const existing = await db.query.userSkills.findFirst({
				where: eq(userSkills.id, userSkillId),
			})

			if (existing) {
				// Update existing skill metrics
				const newMentionCount = existing.mentionCount + 1
				const currentAvgConfidence = parseFloat(existing.averageConfidence || '0')
				const currentAvgDepth = parseFloat(existing.topicDepthAverage || '0')

				// Calculate new averages
				const newAvgConfidence = ((currentAvgConfidence * (newMentionCount - 1)) + confidence) / newMentionCount
				const newAvgDepth = ((currentAvgDepth * (newMentionCount - 1)) + topicDepth) / newMentionCount

				// Calculate proficiency score (0-100) based on confidence, engagement, and frequency
				const engagementScore = engagementLevel === 'high' ? 1.0 : engagementLevel === 'medium' ? 0.7 : 0.4
				const frequencyScore = Math.min(newMentionCount / 10, 1.0) // Max out at 10 mentions
				const proficiencyScore = Math.round((newAvgConfidence * 0.4 + engagementScore * 0.4 + frequencyScore * 0.2) * 100)

				const updated = await db.update(userSkills)
					.set({
						mentionCount: newMentionCount,
						lastMentioned: new Date(),
						averageConfidence: newAvgConfidence.toFixed(3),
						averageEngagement: this.calculateAverageEngagement(existing.averageEngagement || 'medium', engagementLevel, newMentionCount),
						topicDepthAverage: newAvgDepth.toFixed(2),
						proficiencyScore: proficiencyScore.toString(),
						updatedAt: new Date(),
					})
					.where(eq(userSkills.id, userSkillId))
					.returning()

				console.log(`✅ User skill updated: ${updated[0].skillName} (mentions: ${newMentionCount}, proficiency: ${proficiencyScore})`)
				return updated[0].id
			} else {
				// Create new user skill
				const proficiencyScore = Math.round((confidence * 0.4 + (engagementLevel === 'high' ? 1.0 : engagementLevel === 'medium' ? 0.7 : 0.4) * 0.4 + 0.1 * 0.2) * 100)

				const inserted = await db.insert(userSkills).values({
					id: userSkillId,
					userId: userId,
					skillName: norm,
					mentionCount: 1,
					lastMentioned: new Date(),
					proficiencyScore: proficiencyScore.toString(),
					averageConfidence: confidence.toFixed(3),
					averageEngagement: engagementLevel,
					topicDepthAverage: topicDepth.toFixed(2),
					synonyms: null,
				}).returning()

				console.log(`✅ New user skill created: ${inserted[0].skillName} (proficiency: ${proficiencyScore})`)
				return inserted[0].id
			}
		} catch (error) {
			console.error('❌ Failed to upsert user skill:', error)
			throw error
		}
	}

	/**
	 * Create detailed skill mention record for audit trail
	 */

	// TODO: USE AFTER
	async createSkillMention(params: {
		userSkillId: string
		userId: string
		sessionId?: string | null
		messageIndex?: number | null
		mentionText?: string | null
		confidence?: number | null
		engagementLevel?: string | null
		topicDepth?: number | null
		conversationContext?: string | null
	}) {
		try {
			console.log('💾 Inserting skill mention for user skill:', params.userSkillId)
			const inserted = await db.insert(skillMentions).values({
				userSkillId: params.userSkillId,
				userId: params.userId,
				sessionId: params.sessionId ?? null,
				messageIndex: params.messageIndex ?? null,
				mentionText: params.mentionText ?? null,
				confidence: params.confidence != null ? String(params.confidence) : null,
				engagementLevel: params.engagementLevel ?? null,
				topicDepth: params.topicDepth != null ? String(params.topicDepth) : null,
				conversationContext: params.conversationContext ?? null,
			}).returning()

			console.log('✅ Skill mention inserted with id:', inserted[0].id)
			return inserted[0]
		} catch (error) {
			console.error('❌ Failed to insert skill mention:', error)
			throw error
		}
	}

	/**
	 * Calculate average engagement level
	 */

	// TODO: USE AFTER
	private calculateAverageEngagement(currentAvg: string, newEngagement: string, totalCount: number): string {
		const engagementToScore = { 'high': 3, 'medium': 2, 'low': 1 }
		const scoreToEngagement = { 3: 'high', 2: 'medium', 1: 'low' }

		const currentScore = engagementToScore[currentAvg as keyof typeof engagementToScore] || 2
		const newScore = engagementToScore[newEngagement as keyof typeof engagementToScore] || 2

		const avgScore = ((currentScore * (totalCount - 1)) + newScore) / totalCount
		const roundedScore = Math.round(avgScore) as keyof typeof scoreToEngagement

		return scoreToEngagement[roundedScore] || 'medium'
	}
}
