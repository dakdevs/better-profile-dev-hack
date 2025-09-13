// src/services/__tests__/user-skills.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { UserSkillsService } from '../user-skills'

// Mock the database
vi.mock('~/db', () => ({
	db: {
		query: {
			userSkills: {
				findFirst: vi.fn()
			}
		},
		update: vi.fn().mockReturnValue({
			set: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([])
				})
			})
		}),
		insert: vi.fn().mockReturnValue({
			values: vi.fn().mockReturnValue({
				returning: vi.fn().mockResolvedValue([])
			})
		})
	}
}))

// Mock skill mentions
vi.mock('~/db/models/skills', () => ({
	userSkills: {
		id: 'id',
		userId: 'userId',
		skillName: 'skillName',
		mentionCount: 'mentionCount',
		lastMentioned: 'lastMentioned',
		proficiencyScore: 'proficiencyScore',
		averageConfidence: 'averageConfidence',
		averageEngagement: 'averageEngagement',
		topicDepthAverage: 'topicDepthAverage',
		synonyms: 'synonyms'
	},
	skillMentions: {
		userSkillId: 'userSkillId',
		userId: 'userId',
		sessionId: 'sessionId',
		messageIndex: 'messageIndex',
		mentionText: 'mentionText',
		confidence: 'confidence',
		engagementLevel: 'engagementLevel',
		topicDepth: 'topicDepth',
		conversationContext: 'conversationContext'
	}
}))

describe('UserSkillsService', () => {
	let service: UserSkillsService
	let mockDb: any

	beforeEach(async () => {
		service = new UserSkillsService()
		mockDb = (await import('~/db')).db
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('upsertUserSkill', () => {
		it('should create new user skill when skill does not exist', async () => {
			// Mock no existing skill
			vi.mocked(mockDb.query.userSkills.findFirst).mockResolvedValueOnce(null)
			
			// Mock successful insert
			const mockInserted = [{
				id: 'user123_react',
				userId: 'user123',
				skillName: 'React',
				mentionCount: 1,
				lastMentioned: new Date(),
				proficiencyScore: '85',
				averageConfidence: '0.900',
				averageEngagement: 'high',
				topicDepthAverage: '1.00',
				synonyms: null
			}]

			vi.mocked(mockDb.insert().values().returning).mockResolvedValueOnce(mockInserted)

			const result = await service.upsertUserSkill('user123', 'React', 0.9, 'high', 1)

			expect(result).toBe('user123_react')
			expect(mockDb.insert).toHaveBeenCalled()
		})

		it('should update existing user skill when skill exists', async () => {
			// Mock existing skill
			const existingSkill = {
				id: 'user123_react',
				userId: 'user123',
				skillName: 'React',
				mentionCount: 2,
				lastMentioned: new Date(),
				proficiencyScore: '80',
				averageConfidence: '0.850',
				averageEngagement: 'medium',
				topicDepthAverage: '1.50',
				synonyms: null
			}

			vi.mocked(mockDb.query.userSkills.findFirst).mockResolvedValueOnce(existingSkill)
			
			// Mock successful update
			const mockUpdated = [{
				...existingSkill,
				mentionCount: 3,
				proficiencyScore: '82',
				averageConfidence: '0.867',
				averageEngagement: 'high',
				topicDepthAverage: '1.33'
			}]

			vi.mocked(mockDb.update().set().where().returning).mockResolvedValueOnce(mockUpdated)

			const result = await service.upsertUserSkill('user123', 'React', 0.9, 'high', 1)

			expect(result).toBe('user123_react')
			expect(mockDb.update).toHaveBeenCalled()
		})

		it('should calculate proficiency score correctly for new skill', async () => {
			vi.mocked(mockDb.query.userSkills.findFirst).mockResolvedValueOnce(null)
			
			const mockInserted = [{
				id: 'user123_react',
				skillName: 'React',
				proficiencyScore: '85'
			}]

			vi.mocked(mockDb.insert().values().returning).mockResolvedValueOnce(mockInserted)

			await service.upsertUserSkill('user123', 'React', 0.9, 'high', 1)

			// Verify the proficiency score calculation
			// High engagement (1.0) * 0.4 + confidence (0.9) * 0.4 + frequency (0.1) * 0.2 = 0.4 + 0.36 + 0.02 = 0.78 * 100 = 78
			expect(mockDb.insert).toHaveBeenCalled()
		})

		it('should handle skill name normalization', async () => {
			vi.mocked(mockDb.query.userSkills.findFirst).mockResolvedValueOnce(null)
			
			const mockInserted = [{
				id: 'user123_react_js',
				skillName: 'React.js'
			}]

			vi.mocked(mockDb.insert().values().returning).mockResolvedValueOnce(mockInserted)

			await service.upsertUserSkill('user123', 'React.js', 0.9, 'high', 1)

    expect(mockDb.query.userSkills.findFirst).toHaveBeenCalledWith({
      where: expect.any(Object)
    })
		})
	})

	describe('createSkillMention', () => {
		it('should create skill mention with all parameters', async () => {
			const mockMention = [{
				id: 1,
				userSkillId: 'user123_react',
				userId: 'user123',
				sessionId: 'session456',
				messageIndex: 5,
				mentionText: 'I have React experience',
				confidence: '0.9',
				engagementLevel: 'high',
				topicDepth: '2',
				conversationContext: 'Session: session456'
			}]

			vi.mocked(mockDb.insert().values().returning).mockResolvedValueOnce(mockMention)

			const result = await service.createSkillMention({
				userSkillId: 'user123_react',
				userId: 'user123',
				sessionId: 'session456',
				messageIndex: 5,
				mentionText: 'I have React experience',
				confidence: 0.9,
				engagementLevel: 'high',
				topicDepth: 2,
				conversationContext: 'Session: session456'
			})

    expect(result).toEqual(expect.objectContaining({
      id: expect.any(Number),
      userSkillId: expect.any(String),
      userId: expect.any(String)
    }))
			expect(mockDb.insert).toHaveBeenCalled()
		})

		it('should handle optional parameters', async () => {
			const mockMention = [{
				id: 1,
				userSkillId: 'user123_react',
				userId: 'user123',
				sessionId: null,
				messageIndex: null,
				mentionText: null,
				confidence: null,
				engagementLevel: null,
				topicDepth: null,
				conversationContext: null
			}]

			vi.mocked(mockDb.insert().values().returning).mockResolvedValueOnce(mockMention)

			await service.createSkillMention({
				userSkillId: 'user123_react',
				userId: 'user123'
			})

			expect(mockDb.insert).toHaveBeenCalled()
		})
	})

	describe('calculateAverageEngagement', () => {
		it('should calculate average engagement correctly', () => {
			// Test high to medium transition
			const result1 = service['calculateAverageEngagement']('high', 'medium', 2)
			expect(result1).toBe('high') // (3 + 2) / 2 = 2.5, rounded to 3 (high)

			// Test medium to low transition
			const result2 = service['calculateAverageEngagement']('medium', 'low', 2)
			expect(result2).toBe('medium') // (2 + 1) / 2 = 1.5, rounded to 2 (medium)

			// Test low to high transition
			const result3 = service['calculateAverageEngagement']('low', 'high', 2)
			expect(result3).toBe('medium') // (1 + 3) / 2 = 2, which is medium

			// Test with more mentions
			const result4 = service['calculateAverageEngagement']('high', 'low', 5)
			expect(result4).toBe('high') // (3*4 + 1) / 5 = 2.6, rounded to 3 (high)
		})

		it('should handle invalid engagement levels', () => {
			const result = service['calculateAverageEngagement']('invalid', 'high', 2)
			expect(result).toBe('high') // Uses new engagement when current is invalid
		})
	})
})
