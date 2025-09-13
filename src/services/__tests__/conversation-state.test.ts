// src/services/__tests__/conversation-state.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ConversationStateService } from '../conversation-state'
import type { ResponseGrade, BuzzwordData } from '~/types/interview-grading'

// Mock the database
vi.mock('~/db', () => ({
	db: {
		query: {
			interviewSessions: {
				findFirst: vi.fn()
			}
		},
		update: vi.fn().mockReturnValue({
			set: vi.fn().mockReturnValue({
				where: vi.fn().mockResolvedValue([])
			})
		}),
		insert: vi.fn().mockReturnValue({
			values: vi.fn().mockReturnValue({
				returning: vi.fn().mockResolvedValue([])
			})
		})
	}
}))

// Mock the database models
vi.mock('~/db/models/interviews', () => ({
	interviewSessions: {
		userId: 'userId',
		sessionId: 'sessionId',
		topicsExplored: 'topicsExplored',
		skillsIdentified: 'skillsIdentified',
		finalAnalysis: 'finalAnalysis',
		buzzwords: 'buzzwords',
		maxDepthReached: 'maxDepthReached',
		totalDepth: 'totalDepth',
		topicTreeState: 'topicTreeState',
		currentPath: 'currentPath',
		exhaustedTopics: 'exhaustedTopics',
		status: 'status',
		createdAt: 'createdAt',
		updatedAt: 'updatedAt'
	}
}))

// Mock the embeddings model
vi.mock('~/db/models/embeddings', () => ({
	embeddings: {
		userId: 'userId',
		sessionId: 'sessionId',
		content: 'content',
		embedding: 'embedding',
		messageIndex: 'messageIndex'
	}
}))

// Mock the embeddings utility
vi.mock('~/utils/embeddings', () => ({
	embedOne: vi.fn()
}))

describe('ConversationStateService', () => {
	let service: ConversationStateService
	let mockDb: any

	beforeEach(async () => {
		service = new ConversationStateService()
		mockDb = (await import('~/db')).db
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('initializeConversationState', () => {
		it('should initialize conversation state with topic tree', () => {
			const state = service.initializeConversationState('test-session')

			expect(state.topicTree.size).toBe(1)
			expect(state.currentPath).toEqual(['root'])
			expect(state.exhaustedTopics).toEqual([])
			expect(state.grades).toEqual([])
			expect(state.buzzwords.size).toBe(0)
			expect(state.maxDepthReached).toBe(0)
			expect(state.totalDepth).toBe(0)

			const rootNode = state.topicTree.get('root')
			expect(rootNode?.name).toBe('General Background')
			expect(rootNode?.status).toBe('exploring')
		})
	})

	describe('getConversationState', () => {
		it('should return conversation state if exists', () => {
			const state = service.initializeConversationState('test-session')
			const retrieved = service.getConversationState('test-session')

			expect(retrieved).toEqual(state)
		})

		it('should return undefined if state does not exist', () => {
			const retrieved = service.getConversationState('non-existent-session')
			expect(retrieved).toBeUndefined()
		})
	})

	describe('updateConversationState', () => {
		it('should add grade and update buzzwords', () => {
			const state = service.initializeConversationState('test-session')
			
			const grade: ResponseGrade = {
				messageIndex: 1,
				score: 1.8,
				timestamp: '2024-01-01T10:00:00Z',
				content: 'Test response',
				engagementLevel: 'high'
			}

			const buzzwords = ['react', 'javascript', 'frontend']

			service.updateConversationState('test-session', grade, buzzwords, 1)

			expect(state.grades).toHaveLength(1)
			expect(state.grades[0]).toEqual(grade)
			expect(state.buzzwords.size).toBe(3)
			expect(state.buzzwords.get('react')?.count).toBe(1)
			expect(state.buzzwords.get('react')?.sources).toEqual(new Set([1]))
		})

		it('should increment buzzword counts for existing terms', () => {
			const state = service.initializeConversationState('test-session')
			
			const grade1: ResponseGrade = {
				messageIndex: 1,
				score: 1.5,
				timestamp: '2024-01-01T10:00:00Z',
				content: 'First response',
				engagementLevel: 'medium'
			}

			const grade2: ResponseGrade = {
				messageIndex: 2,
				score: 1.8,
				timestamp: '2024-01-01T10:01:00Z',
				content: 'Second response',
				engagementLevel: 'high'
			}

			service.updateConversationState('test-session', grade1, ['react', 'javascript'], 1)
			service.updateConversationState('test-session', grade2, ['react', 'typescript'], 2)

			expect(state.buzzwords.get('react')?.count).toBe(2)
			expect(state.buzzwords.get('react')?.sources).toEqual(new Set([1, 2]))
			expect(state.buzzwords.get('javascript')?.count).toBe(1)
			expect(state.buzzwords.get('typescript')?.count).toBe(1)
		})
	})

	describe('updateTopicTree', () => {
		it('should delegate to topic tree manager', () => {
			const state = service.initializeConversationState('test-session')
			
			const analysis = {
				engagementLevel: 'high',
				exhaustionSignals: [],
				newTopics: ['React'],
				subtopics: [],
				responseLength: 'detailed',
				confidenceLevel: 'confident',
				buzzwords: []
			}

			service.updateTopicTree('test-session', analysis, 'I have React experience', 1)

			// Should add mention to root node
			const rootNode = state.topicTree.get('root')
			expect(rootNode?.mentions).toHaveLength(1)
			expect(rootNode?.mentions[0].response).toBe('I have React experience')
		})
	})

	describe('getTopicTreeState', () => {
		it('should return topic tree state string', () => {
			service.initializeConversationState('test-session')
			
			const treeState = service.getTopicTreeState('test-session')
			
			expect(treeState).toContain('General Background')
			expect(treeState).toContain('(depth: 0)')
		})

		it('should return empty string for non-existent session', () => {
			const treeState = service.getTopicTreeState('non-existent-session')
			expect(treeState).toBe('')
		})
	})

	describe('getCurrentPath', () => {
		it('should return current path string', () => {
			service.initializeConversationState('test-session')
			
			const currentPath = service.getCurrentPath('test-session')
			
			expect(currentPath).toBe('General Background')
		})

		it('should return empty string for non-existent session', () => {
			const currentPath = service.getCurrentPath('non-existent-session')
			expect(currentPath).toBe('')
		})
	})

	describe('getExhaustedTopics', () => {
		it('should return exhausted topics string', () => {
			service.initializeConversationState('test-session')
			
			const exhaustedTopics = service.getExhaustedTopics('test-session')
			
			expect(exhaustedTopics).toBe('')
		})

		it('should return empty string for non-existent session', () => {
			const exhaustedTopics = service.getExhaustedTopics('non-existent-session')
			expect(exhaustedTopics).toBe('')
		})
	})

	describe('updateSessionMetrics', () => {
		it('should update session metrics in database', async () => {
			const state = service.initializeConversationState('test-session')
			
			// Add some buzzwords
			state.buzzwords.set('react', { count: 3, sources: new Set([1, 2, 3]) })
			state.buzzwords.set('javascript', { count: 2, sources: new Set([1, 2]) })

			await service.updateSessionMetrics(
				'test-session',
				5,
				'high',
				85,
				state.buzzwords,
				2,
				1
			)

			expect(mockDb.update).toHaveBeenCalled()
		})

		it('should handle non-existent session gracefully', async () => {
			await service.updateSessionMetrics(
				'non-existent-session',
				0,
				'medium',
				0,
				new Map(),
				0,
				0
			)

			// Should not throw error and should not call update for non-existent session
			expect(mockDb.update).not.toHaveBeenCalled()
		})
	})

	describe('getOrCreateSession', () => {
		it('should return existing session if found', async () => {
			const existingSession = {
				id: 'test-session',
				userId: 'user123',
				sessionType: 'interview',
				title: 'AI Interview Session',
				description: 'Adaptive interview session for skill assessment',
				status: 'active'
			}

			vi.mocked(mockDb.query.interviewSessions.findFirst).mockResolvedValueOnce(existingSession)

			const result = await service.getOrCreateSession('user123', 'test-session')

			expect(result).toEqual(existingSession)
			expect(mockDb.insert).not.toHaveBeenCalled()
		})

		it('should create new session if not found', async () => {
			vi.mocked(mockDb.query.interviewSessions.findFirst).mockResolvedValueOnce(null)
			
			const newSession = {
				id: 'test-session',
				userId: 'user123',
				sessionType: 'interview',
				title: 'AI Interview Session',
				description: 'Adaptive interview session for skill assessment',
				status: 'active'
			}

			vi.mocked(mockDb.insert().values().returning).mockResolvedValueOnce([newSession])

			const result = await service.getOrCreateSession('user123', 'test-session')

			expect(result).toEqual(newSession)
			expect(mockDb.insert).toHaveBeenCalled()
		})
	})

	describe('storeConversationEmbedding', () => {
		it('should store conversation embedding successfully', async () => {
			const { embedOne } = await import('~/utils/embeddings')
			vi.mocked(embedOne).mockResolvedValueOnce([0.1, 0.2, 0.3, 0.4, 0.5])

			vi.mocked(mockDb.insert().values().returning).mockResolvedValueOnce([{
				id: 1,
				userId: 'user123',
				sessionId: 'session456',
				content: 'Test content',
				embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
				messageIndex: 1
			}])

			await service.storeConversationEmbedding(
				'Test content',
				'user123',
				'session456',
				1
			)

			expect(embedOne).toHaveBeenCalledWith('Test content')
			expect(mockDb.insert).toHaveBeenCalled()
		})

		it('should handle embedding generation failure', async () => {
			const { embedOne } = await import('~/utils/embeddings')
			vi.mocked(embedOne).mockResolvedValueOnce([])

			await service.storeConversationEmbedding(
				'Test content',
				'user123',
				'session456',
				1
			)

			expect(embedOne).toHaveBeenCalledWith('Test content')
			expect(mockDb.insert).not.toHaveBeenCalled()
		})

		it('should handle embedding service error', async () => {
			const { embedOne } = await import('~/utils/embeddings')
			vi.mocked(embedOne).mockRejectedValueOnce(new Error('Embedding service error'))

			await expect(service.storeConversationEmbedding(
				'Test content',
				'user123',
				'session456',
				1
			)).rejects.toThrow('Embedding service error')
		})
	})
})
