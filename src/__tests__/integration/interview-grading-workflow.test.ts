// src/__tests__/integration/interview-grading-workflow.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { InterviewGradingService } from '~/services/interview-grading'
import { UserSkillsService } from '~/services/user-skills'
import { ConversationStateService } from '~/services/conversation-state'
import { TopicTreeManager } from '~/services/topic-tree-manager'
import type { ResponseAnalysis } from '~/types/interview-grading'

// Mock all external dependencies
vi.mock('~/config/server-config', () => ({
	serverConfig: {
		ai: {
			openRouterApiKey: 'test-api-key'
		}
	}
}))

// Mock the AI agents
vi.mock('~/ai/mastra', () => ({
	mastra: {
		getAgent: vi.fn()
	}
}))

vi.mock('~/db', () => ({
	db: {
		query: {
			userSkills: {
				findFirst: vi.fn()
			},
			interviewSessions: {
				findFirst: vi.fn()
			}
		},
		update: vi.fn().mockReturnValue({
			set: vi.fn().mockReturnValue({
				where: vi.fn()
			})
		}),
		insert: vi.fn().mockReturnValue({
			values: vi.fn().mockReturnValue({
				returning: vi.fn()
			})
		})
	}
}))

vi.mock('~/db/models/skills', () => ({
	userSkills: {},
	skillMentions: {}
}))

vi.mock('~/db/models/interviews', () => ({
	interviewSessions: {}
}))

vi.mock('~/db/models/embeddings', () => ({
	embeddings: {}
}))

vi.mock('~/utils/embeddings', () => ({
	embedOne: vi.fn()
}))

vi.mock('~/services/skill-extraction', () => ({
	skillExtractionService: {
		extractSkills: vi.fn()
	}
}))

describe('Interview Grading Workflow Integration', () => {
	let gradingService: InterviewGradingService
	let userSkillsService: UserSkillsService
	let conversationStateService: ConversationStateService
	let topicTreeManager: TopicTreeManager
	let mockDb: any
	let mockFetch: any

	beforeEach(async () => {
		gradingService = new InterviewGradingService()
		userSkillsService = new UserSkillsService()
		conversationStateService = new ConversationStateService()
		topicTreeManager = new TopicTreeManager()
		
		mockDb = (await import('~/db')).db
		mockFetch = vi.fn()
		global.fetch = mockFetch
		
		// Mock AI agents
		const mockMastra = (await import('~/ai/mastra')).mastra
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

	describe('Complete Grading Workflow', () => {
		it('should process a high-quality response end-to-end', async () => {
			const sessionId = 'test-session-123'
			const userId = 'user-456'
			const userResponse = 'I have extensive experience with React development, including building complex component architectures, implementing state management with Redux, and optimizing performance with React.memo and useMemo. I\'ve also worked with TypeScript for type safety and Jest for testing.'

			// Mock AI analysis response
			const mockAnalysisResponse = {
				choices: [{
					message: {
						content: JSON.stringify({
							engagementLevel: 'high',
							exhaustionSignals: [],
							newTopics: ['React Development', 'State Management', 'Performance Optimization'],
							subtopics: ['component architecture', 'redux', 'typescript', 'testing'],
							responseLength: 'detailed',
							confidenceLevel: 'confident',
							buzzwords: ['react', 'component architecture', 'redux', 'typescript', 'jest', 'performance optimization', 'react.memo', 'usememo']
						})
					}
				}]
			}

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockAnalysisResponse)
			})

			// Mock skill extraction
			const { skillExtractionService } = await import('~/services/skill-extraction')
			vi.mocked(skillExtractionService.extractSkills).mockResolvedValueOnce({
				skills: [
					{ name: 'React', evidence: 'react development', confidence: 0.95 },
					{ name: 'Redux', evidence: 'state management with redux', confidence: 0.9 },
					{ name: 'TypeScript', evidence: 'typescript for type safety', confidence: 0.85 },
					{ name: 'Jest', evidence: 'jest for testing', confidence: 0.8 }
				]
			})

			// Mock database operations
			vi.mocked(mockDb.query.userSkills.findFirst).mockResolvedValue(null) // New skills
			vi.mocked(mockDb.query.interviewSessions.findFirst).mockResolvedValue(null) // New session
			
			const mockInsertedSkill = [{
				id: 'user-456_react',
				skillName: 'React',
				proficiencyScore: '95'
			}]
			vi.mocked(mockDb.insert().values().returning).mockResolvedValue(mockInsertedSkill)

			const mockInsertedSession = [{
				id: sessionId,
				userId: userId,
				status: 'active'
			}]
			vi.mocked(mockDb.insert().values().returning).mockResolvedValue(mockInsertedSession)

			// Initialize conversation state
			const state = conversationStateService.initializeConversationState(sessionId)

			// Step 1: Analyze response
			const analysis = await gradingService.analyzeResponse(userResponse)
			expect(analysis.engagementLevel).toBe('high')
			expect(analysis.newTopics).toContain('React Development')
			expect(analysis.buzzwords).toContain('react')

			// Step 2: Grade response
			const score = await gradingService.gradeResponse(userResponse, analysis)
			expect(score).toBeGreaterThan(1.5)

			// Step 3: Update topic tree
			conversationStateService.updateTopicTree(sessionId, analysis, userResponse, 1)
			
			// Verify topic tree was updated
			const rootNode = state.topicTree.get('root')
			expect(rootNode?.mentions).toHaveLength(1)
			expect(rootNode?.status).toBe('rich')
			expect(state.topicTree.size).toBeGreaterThan(1) // Should have subtopics

			// Step 4: Create grade record
			const grade = {
				messageIndex: 1,
				score,
				timestamp: new Date().toISOString(),
				content: userResponse,
				engagementLevel: analysis.engagementLevel
			}

			// Step 5: Update conversation state
			conversationStateService.updateConversationState(sessionId, grade, analysis.buzzwords, 1)
			expect(state.grades).toHaveLength(1)
			expect(state.buzzwords.size).toBeGreaterThan(0)

			// Step 6: Extract and store skills
			const skills = await gradingService.extractSkillsFromText(userResponse)
			expect(skills).toHaveLength(4)

			for (const { skill, evidence, confidence } of skills) {
				const userSkillId = await userSkillsService.upsertUserSkill(
					userId,
					skill,
					confidence,
					analysis.engagementLevel,
					state.totalDepth
				)

				await userSkillsService.createSkillMention({
					userSkillId,
					userId,
					sessionId,
					messageIndex: 1,
					mentionText: evidence,
					confidence,
					engagementLevel: analysis.engagementLevel,
					topicDepth: state.totalDepth,
					conversationContext: `Session: ${sessionId}`
				})
			}

			// Step 7: Update session metrics
			const avgScore = state.grades.reduce((sum, g) => sum + g.score, 0) / state.grades.length
			await conversationStateService.updateSessionMetrics(
				sessionId,
				state.grades.length,
				analysis.engagementLevel,
				avgScore * 50,
				state.buzzwords,
				state.maxDepthReached,
				state.totalDepth
			)

			// Step 8: Generate summary
			const summary = gradingService.generateSummaryTree(sessionId, state)
			expect(summary.totalNodes).toBeGreaterThan(1)
			expect(summary.topicCoverage.explored).toBeGreaterThan(0)
			expect(summary.buzzwords.length).toBeGreaterThan(0)
			expect(summary.topicTreeState).toContain('General Background')
		})

		it('should handle topic exhaustion and backtracking', async () => {
			const sessionId = 'test-session-exhaustion'
			const userResponse = 'I don\'t know much about that topic.'

			// Mock low engagement analysis
			const mockAnalysisResponse = {
				choices: [{
					message: {
						content: JSON.stringify({
							engagementLevel: 'low',
							exhaustionSignals: ['short_answer', 'dont_know'],
							newTopics: [],
							subtopics: [],
							responseLength: 'brief',
							confidenceLevel: 'struggling',
							buzzwords: []
						})
					}
				}]
			}

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(mockAnalysisResponse)
			})

			// Initialize state with some existing topics
			const state = conversationStateService.initializeConversationState(sessionId)
			
			// First create some subtopics
			const highEngagementAnalysis = {
				engagementLevel: 'high' as const,
				exhaustionSignals: [],
				newTopics: ['React', 'JavaScript'],
				subtopics: [],
				responseLength: 'detailed' as const,
				confidenceLevel: 'confident' as const,
				buzzwords: []
			}

			conversationStateService.updateTopicTree(sessionId, highEngagementAnalysis, 'I know React and JavaScript', 1)

			// Now test exhaustion
			const analysis = await gradingService.analyzeResponse(userResponse)
			expect(analysis.engagementLevel).toBe('low')
			expect(analysis.exhaustionSignals).toContain('dont_know')

			const score = await gradingService.gradeResponse(userResponse, analysis)
			expect(score).toBeLessThan(1.0)

			// Update topic tree with exhaustion
			conversationStateService.updateTopicTree(sessionId, analysis, userResponse, 2)

			// Verify topic was marked as exhausted
			const currentTopicId = state.currentPath[state.currentPath.length - 1]
			const currentTopic = state.topicTree.get(currentTopicId)
			expect(currentTopic?.status).toBe('unexplored') // Topic remains unexplored after backtracking
			// The exhausted topics should contain the React topic ID (the one that was exhausted)
			expect(state.exhaustedTopics.length).toBeGreaterThan(0)
		})

		it('should return empty results when AI service fails (skill-agnostic approach)', async () => {
			const userResponse = 'I work with React and JavaScript'

			// Mock skill extraction failure
			const { skillExtractionService } = await import('~/services/skill-extraction')
			vi.mocked(skillExtractionService.extractSkills).mockRejectedValueOnce(new Error('Service unavailable'))

			const skills = await gradingService.extractSkillsFromText(userResponse)

			// Should return empty results when AI fails (skill-agnostic approach)
			expect(skills).toHaveLength(0)
		})

		it('should generate comprehensive interview summary', async () => {
			const sessionId = 'test-session-summary'
			const state = conversationStateService.initializeConversationState(sessionId)

			// Add multiple grades
			state.grades.push(
				{ messageIndex: 1, score: 1.8, timestamp: '2024-01-01T10:00:00Z', content: 'Great response', engagementLevel: 'high' },
				{ messageIndex: 2, score: 1.5, timestamp: '2024-01-01T10:01:00Z', content: 'Good response', engagementLevel: 'medium' },
				{ messageIndex: 3, score: 1.2, timestamp: '2024-01-01T10:02:00Z', content: 'Okay response', engagementLevel: 'medium' }
			)

			// Add buzzwords
			state.buzzwords.set('react', { count: 5, sources: new Set([1, 2, 3, 4, 5]) })
			state.buzzwords.set('javascript', { count: 3, sources: new Set([1, 2, 3]) })
			state.buzzwords.set('typescript', { count: 1, sources: new Set([1]) })

			// Add topic tree complexity
			const analysis = {
				engagementLevel: 'high' as const,
				exhaustionSignals: [],
				newTopics: ['React', 'JavaScript'],
				subtopics: [],
				responseLength: 'detailed' as const,
				confidenceLevel: 'confident' as const,
				buzzwords: []
			}

			conversationStateService.updateTopicTree(sessionId, analysis, 'I know React and JavaScript', 1)

			const summary = gradingService.generateSummaryTree(sessionId, state)

			expect(summary.sessionId).toBe(sessionId)
			expect(summary.averageScore).toBe(1.5) // (1.8 + 1.5 + 1.2) / 3
			expect(summary.totalNodes).toBeGreaterThan(1)
			expect(summary.buzzwords).toHaveLength(3)
			expect(summary.buzzwords[0].term).toBe('react')
			expect(summary.buzzwords[0].count).toBe(5)
			expect(summary.topicTreeState).toContain('General Background')
			expect(summary.topicCoverage.explored).toBeGreaterThan(0)
		})
	})

	describe('In-Depth Conversation Flow', () => {
		it('should handle a comprehensive back-and-forth conversation with proper topic tree navigation', async () => {
			const sessionId = 'test-session-comprehensive'
			const userId = 'user-comprehensive'
			
			// Initialize conversation state
			const state = conversationStateService.initializeConversationState(sessionId)
			
			// Mock database operations
			vi.mocked(mockDb.query.userSkills.findFirst).mockResolvedValue(null) // New skills
			vi.mocked(mockDb.query.interviewSessions.findFirst).mockResolvedValue(null) // New session
			
			const mockInsertedSkill = [{
				id: `${userId}_react`,
				skillName: 'React',
				proficiencyScore: '85'
			}]
			vi.mocked(mockDb.insert().values().returning).mockResolvedValue(mockInsertedSkill)

			const mockInsertedSession = [{
				id: sessionId,
				userId: userId,
				status: 'active'
			}]
			vi.mocked(mockDb.insert().values().returning).mockResolvedValue(mockInsertedSession)

			// Mock skill extraction service
			const { skillExtractionService } = await import('~/services/skill-extraction')
			
			// === CONVERSATION TURN 1: Initial broad response ===
			console.log('\n=== TURN 1: Initial Response ===')
			const response1 = 'I\'m a frontend developer with 5 years of experience. I primarily work with React, but I also have experience with Vue.js and Angular. I\'m comfortable with JavaScript, TypeScript, and I\'ve worked on both small projects and large enterprise applications.'
			
			// Mock AI analysis for turn 1
			const analysis1Response = {
				choices: [{
					message: {
						content: JSON.stringify({
							engagementLevel: 'high',
							exhaustionSignals: [],
							newTopics: ['Frontend Development', 'React', 'Vue.js', 'Angular'],
							subtopics: ['javascript', 'typescript', 'enterprise applications'],
							responseLength: 'detailed',
							confidenceLevel: 'confident',
							buzzwords: ['frontend', 'react', 'vue.js', 'angular', 'javascript', 'typescript', 'enterprise']
						})
					}
				}]
			}
			
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(analysis1Response)
			})

			vi.mocked(skillExtractionService.extractSkills).mockResolvedValueOnce({
				skills: [
					{ name: 'React', evidence: 'primarily work with React', confidence: 0.95 },
					{ name: 'Vue.js', evidence: 'experience with Vue.js', confidence: 0.8 },
					{ name: 'Angular', evidence: 'experience with Angular', confidence: 0.75 },
					{ name: 'TypeScript', evidence: 'comfortable with TypeScript', confidence: 0.9 }
				]
			})

			const analysis1 = await gradingService.analyzeResponse(response1)
			const score1 = await gradingService.gradeResponse(response1, analysis1)
			
			// Update topic tree - should create subtopics
			conversationStateService.updateTopicTree(sessionId, analysis1, response1, 1)
			conversationStateService.updateConversationState(sessionId, {
				messageIndex: 1,
				score: score1,
				timestamp: new Date().toISOString(),
				content: response1,
				engagementLevel: analysis1.engagementLevel
			}, analysis1.buzzwords, 1)

			// Verify topic tree structure after turn 1
			expect(state.topicTree.size).toBeGreaterThan(1) // Should have subtopics
			expect(state.currentPath.length).toBeGreaterThan(1) // Should be in a subtopic
			expect(state.maxDepthReached).toBeGreaterThan(0)
			
			// Extract and store skills for turn 1
			const skills1 = await gradingService.extractSkillsFromText(response1)
			for (const { skill, evidence, confidence } of skills1) {
				const userSkillId = await userSkillsService.upsertUserSkill(
					userId, skill, confidence, analysis1.engagementLevel, state.totalDepth
				)
				await userSkillsService.createSkillMention({
					userSkillId, userId, sessionId, messageIndex: 1,
					mentionText: evidence, confidence, engagementLevel: analysis1.engagementLevel,
					topicDepth: state.totalDepth, conversationContext: `Turn 1: ${sessionId}`
				})
			}

			// === CONVERSATION TURN 2: Deep dive into React ===
			console.log('\n=== TURN 2: React Deep Dive ===')
			const response2 = 'With React specifically, I\'ve built complex component hierarchies using hooks like useState, useEffect, and custom hooks. I\'ve implemented state management with Redux and Context API. I\'m familiar with React Router for navigation and have experience with testing using Jest and React Testing Library. I\'ve also worked with React performance optimization techniques like React.memo, useMemo, and useCallback.'
			
			const analysis2Response = {
				choices: [{
					message: {
						content: JSON.stringify({
							engagementLevel: 'high',
							exhaustionSignals: [],
							newTopics: ['React Hooks', 'State Management', 'React Testing', 'Performance Optimization'],
							subtopics: ['usestate', 'useeffect', 'redux', 'context api', 'react router', 'jest', 'react testing library', 'react.memo', 'usememo', 'usecallback'],
							responseLength: 'detailed',
							confidenceLevel: 'confident',
							buzzwords: ['react', 'hooks', 'usestate', 'useeffect', 'redux', 'context api', 'react router', 'jest', 'react testing library', 'react.memo', 'usememo', 'usecallback']
						})
					}
				}]
			}
			
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(analysis2Response)
			})

			vi.mocked(skillExtractionService.extractSkills).mockResolvedValueOnce({
				skills: [
					{ name: 'React Hooks', evidence: 'hooks like useState, useEffect', confidence: 0.95 },
					{ name: 'Redux', evidence: 'state management with Redux', confidence: 0.9 },
					{ name: 'Jest', evidence: 'testing using Jest', confidence: 0.85 },
					{ name: 'React Testing Library', evidence: 'React Testing Library', confidence: 0.85 }
				]
			})

			const analysis2 = await gradingService.analyzeResponse(response2)
			const score2 = await gradingService.gradeResponse(response2, analysis2)
			
			// Update topic tree - should go deeper into React
			conversationStateService.updateTopicTree(sessionId, analysis2, response2, 2)
			conversationStateService.updateConversationState(sessionId, {
				messageIndex: 2,
				score: score2,
				timestamp: new Date().toISOString(),
				content: response2,
				engagementLevel: analysis2.engagementLevel
			}, analysis2.buzzwords, 2)

			// Verify deeper navigation
			expect(state.maxDepthReached).toBeGreaterThan(1)
			expect(state.currentPath.length).toBeGreaterThan(2) // Should be deeper in React subtopic
			
			// Extract and store skills for turn 2
			const skills2 = await gradingService.extractSkillsFromText(response2)
			for (const { skill, evidence, confidence } of skills2) {
				const userSkillId = await userSkillsService.upsertUserSkill(
					userId, skill, confidence, analysis2.engagementLevel, state.totalDepth
				)
				await userSkillsService.createSkillMention({
					userSkillId, userId, sessionId, messageIndex: 2,
					mentionText: evidence, confidence, engagementLevel: analysis2.engagementLevel,
					topicDepth: state.totalDepth, conversationContext: `Turn 2: ${sessionId}`
				})
			}

			// === CONVERSATION TURN 3: Exhaustion and backtracking ===
			console.log('\n=== TURN 3: Topic Exhaustion ===')
			const response3 = 'I don\'t really know much about React Server Components or the latest React 18 features. I haven\'t had a chance to work with those yet.'
			
			const analysis3Response = {
				choices: [{
					message: {
						content: JSON.stringify({
							engagementLevel: 'low',
							exhaustionSignals: ['dont_know', 'short_answer', 'limited_knowledge'],
							newTopics: [],
							subtopics: [],
							responseLength: 'brief',
							confidenceLevel: 'struggling',
							buzzwords: ['react server components', 'react 18']
						})
					}
				}]
			}
			
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(analysis3Response)
			})

			const analysis3 = await gradingService.analyzeResponse(response3)
			const score3 = await gradingService.gradeResponse(response3, analysis3)
			
			// Update topic tree - should trigger backtracking
			conversationStateService.updateTopicTree(sessionId, analysis3, response3, 3)
			conversationStateService.updateConversationState(sessionId, {
				messageIndex: 3,
				score: score3,
				timestamp: new Date().toISOString(),
				content: response3,
				engagementLevel: analysis3.engagementLevel
			}, analysis3.buzzwords, 3)

			// Verify exhaustion handling
			expect(analysis3.engagementLevel).toBe('low')
			expect(analysis3.exhaustionSignals).toContain('dont_know')
			expect(score3).toBeLessThan(1.0)
			expect(state.exhaustedTopics.length).toBeGreaterThan(0) // Should have exhausted topics

			// === CONVERSATION TURN 4: Switch to different topic ===
			console.log('\n=== TURN 4: Topic Switch to Vue.js ===')
			const response4 = 'Actually, let me tell you about my Vue.js experience. I\'ve worked extensively with Vue 2 and Vue 3, including the Composition API. I\'ve used Vuex for state management and Vue Router for navigation. I\'ve also worked with Nuxt.js for SSR applications and have experience with Vue testing using Vue Test Utils.'
			
			const analysis4Response = {
				choices: [{
					message: {
						content: JSON.stringify({
							engagementLevel: 'high',
							exhaustionSignals: [],
							newTopics: ['Vue.js Composition API', 'Vuex', 'Vue Router', 'Nuxt.js', 'Vue Testing'],
							subtopics: ['vue 2', 'vue 3', 'composition api', 'vuex', 'vue router', 'nuxt.js', 'ssr', 'vue test utils'],
							responseLength: 'detailed',
							confidenceLevel: 'confident',
							buzzwords: ['vue.js', 'vue 2', 'vue 3', 'composition api', 'vuex', 'vue router', 'nuxt.js', 'ssr', 'vue test utils']
						})
					}
				}]
			}
			
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(analysis4Response)
			})

			vi.mocked(skillExtractionService.extractSkills).mockResolvedValueOnce({
				skills: [
					{ name: 'Vue.js', evidence: 'Vue.js experience', confidence: 0.9 },
					{ name: 'Vuex', evidence: 'Vuex for state management', confidence: 0.85 },
					{ name: 'Nuxt.js', evidence: 'Nuxt.js for SSR applications', confidence: 0.8 },
					{ name: 'Vue Test Utils', evidence: 'Vue testing using Vue Test Utils', confidence: 0.75 }
				]
			})

			const analysis4 = await gradingService.analyzeResponse(response4)
			const score4 = await gradingService.gradeResponse(response4, analysis4)
			
			// Update topic tree - should navigate to Vue.js topic
			conversationStateService.updateTopicTree(sessionId, analysis4, response4, 4)
			conversationStateService.updateConversationState(sessionId, {
				messageIndex: 4,
				score: score4,
				timestamp: new Date().toISOString(),
				content: response4,
				engagementLevel: analysis4.engagementLevel
			}, analysis4.buzzwords, 4)

			// Verify topic switching
			expect(analysis4.engagementLevel).toBe('high')
			expect(score4).toBeGreaterThan(1.5)
			expect(state.topicTree.size).toBeGreaterThan(3) // Should have multiple topic branches
			
			// Extract and store skills for turn 4
			const skills4 = await gradingService.extractSkillsFromText(response4)
			for (const { skill, evidence, confidence } of skills4) {
				const userSkillId = await userSkillsService.upsertUserSkill(
					userId, skill, confidence, analysis4.engagementLevel, state.totalDepth
				)
				await userSkillsService.createSkillMention({
					userSkillId, userId, sessionId, messageIndex: 4,
					mentionText: evidence, confidence, engagementLevel: analysis4.engagementLevel,
					topicDepth: state.totalDepth, conversationContext: `Turn 4: ${sessionId}`
				})
			}

			// === CONVERSATION TURN 5: Return to previous topic with new information ===
			console.log('\n=== TURN 5: Return to React with New Info ===')
			const response5 = 'Actually, I did work on a project recently where we migrated from React 16 to React 18. We used the new concurrent features and Suspense for data fetching. It was challenging but the performance improvements were significant.'
			
			const analysis5Response = {
				choices: [{
					message: {
						content: JSON.stringify({
							engagementLevel: 'high',
							exhaustionSignals: [],
							newTopics: ['React 18 Migration', 'Concurrent Features', 'Suspense'],
							subtopics: ['react 16', 'react 18', 'migration', 'concurrent features', 'suspense', 'data fetching', 'performance'],
							responseLength: 'detailed',
							confidenceLevel: 'confident',
							buzzwords: ['react 16', 'react 18', 'migration', 'concurrent features', 'suspense', 'data fetching', 'performance']
						})
					}
				}]
			}
			
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve(analysis5Response)
			})

			vi.mocked(skillExtractionService.extractSkills).mockResolvedValueOnce({
				skills: [
					{ name: 'React 18', evidence: 'migrated from React 16 to React 18', confidence: 0.9 },
					{ name: 'React Suspense', evidence: 'Suspense for data fetching', confidence: 0.85 },
					{ name: 'React Concurrent Features', evidence: 'new concurrent features', confidence: 0.8 }
				]
			})

			const analysis5 = await gradingService.analyzeResponse(response5)
			const score5 = await gradingService.gradeResponse(response5, analysis5)
			
			// Update topic tree - should return to React with new depth
			conversationStateService.updateTopicTree(sessionId, analysis5, response5, 5)
			conversationStateService.updateConversationState(sessionId, {
				messageIndex: 5,
				score: score5,
				timestamp: new Date().toISOString(),
				content: response5,
				engagementLevel: analysis5.engagementLevel
			}, analysis5.buzzwords, 5)

			// Extract and store skills for turn 5
			const skills5 = await gradingService.extractSkillsFromText(response5)
			for (const { skill, evidence, confidence } of skills5) {
				const userSkillId = await userSkillsService.upsertUserSkill(
					userId, skill, confidence, analysis5.engagementLevel, state.totalDepth
				)
				await userSkillsService.createSkillMention({
					userSkillId, userId, sessionId, messageIndex: 5,
					mentionText: evidence, confidence, engagementLevel: analysis5.engagementLevel,
					topicDepth: state.totalDepth, conversationContext: `Turn 5: ${sessionId}`
				})
			}

			// === FINAL VERIFICATION ===
			console.log('\n=== FINAL VERIFICATION ===')
			
			// Update session metrics
			const avgScore = state.grades.reduce((sum, g) => sum + g.score, 0) / state.grades.length
			await conversationStateService.updateSessionMetrics(
				sessionId,
				state.grades.length,
				'high', // Overall engagement
				avgScore * 50,
				state.buzzwords,
				state.maxDepthReached,
				state.totalDepth
			)

			// Generate comprehensive summary
			const summary = gradingService.generateSummaryTree(sessionId, state)
			
			// Verify conversation state
			expect(state.grades).toHaveLength(5)
			expect(state.buzzwords.size).toBeGreaterThan(10) // Should have many buzzwords
			expect(state.topicTree.size).toBeGreaterThan(5) // Should have multiple topic nodes
			expect(state.maxDepthReached).toBeGreaterThan(2) // Should have reached significant depth
			expect(state.exhaustedTopics.length).toBeGreaterThan(0) // Should have exhausted some topics
			
			// Verify topic tree navigation worked correctly
			const rootNode = state.topicTree.get('root')
			expect(rootNode).toBeDefined()
			expect(rootNode?.children.length).toBeGreaterThan(1) // Should have multiple subtopics
			
			// Verify buzzword tracking
			expect(state.buzzwords.has('react')).toBe(true)
			expect(state.buzzwords.has('vue.js')).toBe(true)
			expect(state.buzzwords.get('react')?.count).toBeGreaterThan(1) // React mentioned multiple times
			
			// Verify summary generation
			expect(summary.sessionId).toBe(sessionId)
			expect(summary.totalNodes).toBeGreaterThan(5)
			expect(summary.buzzwords.length).toBeGreaterThan(10)
			expect(summary.topicCoverage.explored).toBeGreaterThan(0)
			expect(summary.topicCoverage.rich).toBeGreaterThan(0)
			expect(summary.topicTreeState).toContain('General Background')
			expect(summary.topicTreeState).toContain('React')
			expect(summary.topicTreeState).toContain('Vue.js')
			
			// Verify skill extraction worked across all turns
			expect(skills1.length).toBeGreaterThan(0)
			expect(skills2.length).toBeGreaterThan(0)
			expect(skills4.length).toBeGreaterThan(0)
			expect(skills5.length).toBeGreaterThan(0)
			
			console.log('\n=== CONVERSATION SUMMARY ===')
			console.log(`Total turns: ${state.grades.length}`)
			console.log(`Average score: ${avgScore.toFixed(2)}`)
			console.log(`Max depth reached: ${state.maxDepthReached}`)
			console.log(`Total buzzwords: ${state.buzzwords.size}`)
			console.log(`Topic tree nodes: ${state.topicTree.size}`)
			console.log(`Exhausted topics: ${state.exhaustedTopics.length}`)
			console.log(`Topic tree state:\n${summary.topicTreeState}`)
		})
	})

	describe('Error Handling', () => {
		it('should handle AI analysis failure gracefully', async () => {
			mockFetch.mockRejectedValueOnce(new Error('API Error'))

			const result = await gradingService.analyzeResponse('Test response')

			// Should fallback to heuristic analysis
			expect(result.engagementLevel).toBeDefined()
			expect(result.exhaustionSignals).toBeDefined()
			expect(result.buzzwords).toBeDefined()
		})

		it('should handle database errors gracefully', async () => {
			vi.mocked(mockDb.query.userSkills.findFirst).mockRejectedValueOnce(new Error('Database error'))

			await expect(userSkillsService.upsertUserSkill(
				'user123',
				'React',
				0.9,
				'high',
				1
			)).rejects.toThrow('Database error')
		})

		it('should handle embedding service failure', async () => {
			const { embedOne } = await import('~/utils/embeddings')
			vi.mocked(embedOne).mockRejectedValueOnce(new Error('Embedding service error'))

			await expect(conversationStateService.storeConversationEmbedding(
				'Test content',
				'user123',
				'session456',
				1
			)).rejects.toThrow('Embedding service error')
		})
	})
})
