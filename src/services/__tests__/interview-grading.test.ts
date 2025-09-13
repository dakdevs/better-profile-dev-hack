// src/services/__tests__/interview-grading.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { InterviewGradingService } from '../interview-grading'
import type { ResponseAnalysis } from '~/types/interview-grading'

// Mock the server config
vi.mock('~/config/server-config', () => ({
	serverConfig: {
		ai: {
			openRouterApiKey: 'test-api-key'
		}
	}
}))

// Mock the skill extraction service
vi.mock('~/services/skill-extraction', () => ({
	skillExtractionService: {
		extractSkills: vi.fn()
	}
}))

// Mock the AI agents
vi.mock('~/ai/mastra', () => ({
	mastra: {
		getAgent: vi.fn()
	}
}))

describe('InterviewGradingService', () => {
	let service: InterviewGradingService
	let mockFetch: any
	let mockMastra: any

	beforeEach(async () => {
		service = new InterviewGradingService()
		mockFetch = vi.fn()
		global.fetch = mockFetch
		
		// Mock the AI agents
		mockMastra = (await import('~/ai/mastra')).mastra
		const mockTopicAgent = {
			generateText: vi.fn()
		}
		const mockSkillAgent = {
			generateText: vi.fn()
		}
		
		vi.mocked(mockMastra.getAgent).mockImplementation((agentName: string) => {
			if (agentName === 'topicExtractionAgent') return mockTopicAgent
			if (agentName === 'skillExtractionAgent') return mockSkillAgent
			return mockTopicAgent
		})
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('analyzeResponse', () => {
		it('should analyze response with AI successfully', async () => {
			const mockResponse = {
				choices: [{
					message: {
						content: JSON.stringify({
							engagementLevel: 'high',
							exhaustionSignals: [],
							newTopics: ['React', 'JavaScript'],
							subtopics: ['hooks', 'components'],
							responseLength: 'detailed',
							confidenceLevel: 'confident',
							buzzwords: ['react', 'javascript', 'frontend development']
						})
					}
				}]
			}

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockResponse)
			})

			const result = await service.analyzeResponse('I have extensive experience with React and JavaScript development')

			expect(result.engagementLevel).toBe('high')
			expect(result.newTopics).toEqual(['React', 'JavaScript'])
			expect(result.buzzwords).toEqual(['react', 'javascript', 'frontend development'])
			expect(result.confidenceLevel).toBe('confident')
		})

		it('should fallback to heuristic analysis when AI fails', async () => {
			mockFetch.mockRejectedValueOnce(new Error('API Error'))
			
			// Mock topic extraction agent to return topics
			const mockTopicAgent = mockMastra.getAgent('topicExtractionAgent')
			mockTopicAgent.generateText.mockResolvedValueOnce({
				text: JSON.stringify(['React', 'JavaScript'])
			})

			const result = await service.analyzeResponse('I work with React and JavaScript')

			expect(result.engagementLevel).toBe('low') // Short response gets low engagement
			expect(result.exhaustionSignals).toEqual(['short_answer'])
			expect(result.confidenceLevel).toBe('uncertain')
			expect(result.newTopics).toEqual(['React', 'JavaScript'])
		})

		it('should detect exhaustion signals in short responses', async () => {
			// Mock fetch to return a failed response to trigger fallback
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				text: () => Promise.resolve('Internal Server Error')
			})

			const result = await service.analyzeResponse('I don\'t know')

			expect(result.engagementLevel).toBe('low')
			expect(result.exhaustionSignals).toContain('short_answer')
			expect(result.exhaustionSignals).toContain('dont_know')
			expect(result.confidenceLevel).toBe('uncertain') // Should be uncertain when there are exhaustion signals
		})

		it('should extract topics from response text', async () => {
			// Mock fetch to return a failed response to trigger fallback
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				text: () => Promise.resolve('Internal Server Error')
			})

			// Mock topic extraction agent to return specific topics
			const mockTopicAgent = mockMastra.getAgent('topicExtractionAgent')
			mockTopicAgent.generateText.mockResolvedValueOnce({
				text: JSON.stringify(['React', 'Node.js'])
			})
			
			const result = await service.analyzeResponse('I have experience working with React and Node.js')

			expect(result.newTopics).toEqual(['React', 'Node.js']) // AI agent extracts individual topics
		})
	})

	describe('gradeResponse', () => {
		it('should give high score for detailed, confident responses', async () => {
			const analysis: ResponseAnalysis = {
				engagementLevel: 'high',
				exhaustionSignals: [],
				newTopics: ['React'],
				subtopics: [],
				responseLength: 'detailed',
				confidenceLevel: 'confident',
				buzzwords: ['react', 'javascript']
			}

			const score = await service.gradeResponse('Detailed response about React', analysis)

			expect(score).toBeGreaterThan(1.5)
			expect(score).toBeLessThanOrEqual(2.0)
		})

		it('should give low score for brief, struggling responses', async () => {
			const analysis: ResponseAnalysis = {
				engagementLevel: 'low',
				exhaustionSignals: ['short_answer', 'dont_know'],
				newTopics: [],
				subtopics: [],
				responseLength: 'brief',
				confidenceLevel: 'struggling',
				buzzwords: []
			}

			const score = await service.gradeResponse('I don\'t know', analysis)

			expect(score).toBeLessThan(1.0)
			expect(score).toBeGreaterThanOrEqual(0.0)
		})

		it('should give medium score for moderate responses', async () => {
			const analysis: ResponseAnalysis = {
				engagementLevel: 'medium',
				exhaustionSignals: [],
				newTopics: ['JavaScript'],
				subtopics: [],
				responseLength: 'moderate',
				confidenceLevel: 'confident',
				buzzwords: ['javascript']
			}

			const score = await service.gradeResponse('I work with JavaScript', analysis)

			expect(score).toBeGreaterThanOrEqual(1.0)
			expect(score).toBeLessThanOrEqual(1.5)
		})
	})

	describe('extractSkillsFromText', () => {
		it('should extract skills using AI agent when available', async () => {
			// Mock the skill extraction service
			const mockSkillExtractionService = {
				extractSkills: vi.fn().mockResolvedValue({
					skills: [
						{ name: 'React', evidence: 'react development', confidence: 0.9 },
						{ name: 'TypeScript', evidence: 'typescript experience', confidence: 0.8 }
					]
				})
			}
			
			// Mock the import of the skill extraction service
			vi.doMock('~/services/skill-extraction', () => ({
				skillExtractionService: mockSkillExtractionService
			}))

			const result = await service.extractSkillsFromText('I have React and TypeScript experience')

			expect(result).toHaveLength(2)
			expect(result[0].skill).toBe('React')
			expect(result[0].confidence).toBe(0.9)
			expect(result[1].skill).toBe('TypeScript')
			expect(result[1].confidence).toBe(0.8)
		})

		it('should return empty results when AI agent fails (skill-agnostic approach)', async () => {
			// Mock the skill extraction service to fail
			const mockSkillExtractionService = {
				extractSkills: vi.fn().mockRejectedValue(new Error('AI service unavailable'))
			}
			
			// Mock the import of the skill extraction service
			vi.doMock('~/services/skill-extraction', () => ({
				skillExtractionService: mockSkillExtractionService
			}))

			const result = await service.extractSkillsFromText('I work with React and JavaScript')

			// Should return empty results to maintain skill-agnostic approach
			expect(result).toHaveLength(0)
		})

		it('should return empty results when AI fails (skill-agnostic approach)', async () => {
			// Mock the skill extraction service to fail
			const mockSkillExtractionService = {
				extractSkills: vi.fn().mockRejectedValue(new Error('AI service unavailable'))
			}
			
			// Mock the import of the skill extraction service
			vi.doMock('~/services/skill-extraction', () => ({
				skillExtractionService: mockSkillExtractionService
			}))

			const result = await service.extractSkillsFromText('I have experience working with React development')

			// Should return empty results to maintain skill-agnostic approach
			expect(result).toHaveLength(0)
		})
	})

	describe('generateSummaryTree', () => {
		it('should generate comprehensive interview summary', () => {
			const mockState = {
				startTime: '2024-01-01T10:00:00Z',
				grades: [
					{ messageIndex: 1, score: 1.8, timestamp: '2024-01-01T10:01:00Z', content: 'Test response', engagementLevel: 'high' },
					{ messageIndex: 2, score: 1.5, timestamp: '2024-01-01T10:02:00Z', content: 'Another response', engagementLevel: 'medium' }
				],
				topicTree: new Map([
					['root', { id: 'root', name: 'General Background', status: 'exploring', depth: 0, children: ['topic1'] }],
					['topic1', { id: 'topic1', name: 'React Development', status: 'rich', depth: 1, children: [] }]
				]),
				currentPath: ['root', 'topic1'],
				exhaustedTopics: [],
				maxDepthReached: 1,
				buzzwords: new Map([
					['react', { count: 3, sources: new Set([1, 2, 3]) }],
					['javascript', { count: 2, sources: new Set([1, 2]) }]
				])
			}

			const summary = service.generateSummaryTree('test-session', mockState)

			expect(summary.sessionId).toBe('test-session')
			expect(summary.totalNodes).toBe(2)
			expect(summary.maxDepthReached).toBe(1)
			expect(summary.averageScore).toBe(1.65) // (1.8 + 1.5) / 2
			expect(summary.topicCoverage.explored).toBe(2)
			expect(summary.topicCoverage.rich).toBe(1)
			expect(summary.buzzwords).toHaveLength(2)
			expect(summary.buzzwords[0].term).toBe('react')
			expect(summary.buzzwords[0].count).toBe(3)
			expect(summary.topicTreeState).toContain('General Background')
			expect(summary.topicTreeState).toContain('React Development')
		})

		it('should handle empty state gracefully', () => {
			const mockState = {
				startTime: '2024-01-01T10:00:00Z',
				grades: [],
				topicTree: new Map(),
				currentPath: ['root'],
				exhaustedTopics: [],
				maxDepthReached: 0,
				buzzwords: new Map()
			}

			const summary = service.generateSummaryTree('test-session', mockState)

			expect(summary.totalNodes).toBe(0)
			expect(summary.averageScore).toBe(0)
			expect(summary.buzzwords).toHaveLength(0)
		})
	})

	describe('topBuzzwords', () => {
		it('should return top buzzwords sorted by count', () => {
			const mockState = {
				buzzwords: new Map([
					['react', { count: 5, sources: new Set([1, 2, 3, 4, 5]) }],
					['javascript', { count: 3, sources: new Set([1, 2, 3]) }],
					['typescript', { count: 1, sources: new Set([1]) }]
				])
			}

			const result = service['topBuzzwords'](mockState, 10)

			expect(result).toHaveLength(3)
			expect(result[0].term).toBe('react')
			expect(result[0].count).toBe(5)
			expect(result[1].term).toBe('javascript')
			expect(result[1].count).toBe(3)
			expect(result[2].term).toBe('typescript')
			expect(result[2].count).toBe(1)
		})

		it('should limit results to specified limit', () => {
			const mockState = {
				buzzwords: new Map([
					['react', { count: 5, sources: new Set([1, 2, 3, 4, 5]) }],
					['javascript', { count: 3, sources: new Set([1, 2, 3]) }],
					['typescript', { count: 1, sources: new Set([1]) }]
				])
			}

			const result = service['topBuzzwords'](mockState, 2)

			expect(result).toHaveLength(2)
			expect(result[0].term).toBe('react')
			expect(result[1].term).toBe('javascript')
		})
	})
})
