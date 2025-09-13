// src/services/__tests__/topic-tree-manager.test.ts

import { describe, it, expect, beforeEach } from 'vitest'
import { TopicTreeManager } from '../topic-tree-manager'
import type { ConversationState, ResponseAnalysis } from '~/types/interview-grading'

describe('TopicTreeManager', () => {
	let manager: TopicTreeManager
	let mockState: ConversationState

	beforeEach(() => {
		manager = new TopicTreeManager()
		mockState = manager.initializeTopicTree('test-session')
	})

	describe('initializeTopicTree', () => {
		it('should create initial state with root node', () => {
			expect(mockState.topicTree.size).toBe(1)
			expect(mockState.currentPath).toEqual(['root'])
			expect(mockState.exhaustedTopics).toEqual([])
			expect(mockState.grades).toEqual([])
			expect(mockState.buzzwords.size).toBe(0)
			expect(mockState.maxDepthReached).toBe(0)
			expect(mockState.totalDepth).toBe(0)

			const rootNode = mockState.topicTree.get('root')
			expect(rootNode).toBeDefined()
			expect(rootNode?.name).toBe('General Background')
			expect(rootNode?.depth).toBe(0)
			expect(rootNode?.status).toBe('exploring')
			expect(rootNode?.parentId).toBeNull()
		})
	})

	describe('updateTopicTree', () => {
		it('should add mention to current node', () => {
			const analysis: ResponseAnalysis = {
				engagementLevel: 'high',
				exhaustionSignals: [],
				newTopics: [],
				subtopics: [],
				responseLength: 'detailed',
				confidenceLevel: 'confident',
				buzzwords: []
			}

			manager.updateTopicTree(mockState, analysis, 'I have React experience', 1)

			const rootNode = mockState.topicTree.get('root')
			expect(rootNode?.mentions).toHaveLength(1)
			expect(rootNode?.mentions[0].messageIndex).toBe(1)
			expect(rootNode?.mentions[0].response).toBe('I have React experience')
			expect(rootNode?.mentions[0].engagementLevel).toBe('high')
		})

		it('should create subtopics and go deeper for high engagement with new topics', () => {
			const analysis: ResponseAnalysis = {
				engagementLevel: 'high',
				exhaustionSignals: [],
				newTopics: ['React Development', 'JavaScript'],
				subtopics: [],
				responseLength: 'detailed',
				confidenceLevel: 'confident',
				buzzwords: []
			}

			manager.updateTopicTree(mockState, analysis, 'I have extensive React and JavaScript experience', 1)

			// Should create subtopics
			expect(mockState.topicTree.size).toBe(3) // root + 2 subtopics
			
			// Root should be marked as rich
			const rootNode = mockState.topicTree.get('root')
			expect(rootNode?.status).toBe('rich')
			expect(rootNode?.children).toHaveLength(2)

			// Should navigate to first subtopic
			expect(mockState.currentPath).toHaveLength(2)
			expect(mockState.currentPath[1]).toContain('react_development')
			expect(mockState.maxDepthReached).toBe(1)
		})

		it('should mark topic as exhausted and backtrack for low engagement', () => {
			const analysis: ResponseAnalysis = {
				engagementLevel: 'low',
				exhaustionSignals: ['short_answer', 'dont_know'],
				newTopics: [],
				subtopics: [],
				responseLength: 'brief',
				confidenceLevel: 'struggling',
				buzzwords: []
			}

			manager.updateTopicTree(mockState, analysis, 'I don\'t know', 1)

			// Root should be marked as exhausted
			const rootNode = mockState.topicTree.get('root')
			expect(rootNode?.status).toBe('exhausted')
			expect(mockState.exhaustedTopics).toContain('root')
		})

		it('should navigate to unexplored sibling when available', () => {
			// First, create some subtopics
			const highEngagementAnalysis: ResponseAnalysis = {
				engagementLevel: 'high',
				exhaustionSignals: [],
				newTopics: ['React', 'JavaScript'],
				subtopics: [],
				responseLength: 'detailed',
				confidenceLevel: 'confident',
				buzzwords: []
			}

			manager.updateTopicTree(mockState, highEngagementAnalysis, 'I know React and JavaScript', 1)

			// Now exhaust the current topic (React)
			const lowEngagementAnalysis: ResponseAnalysis = {
				engagementLevel: 'low',
				exhaustionSignals: ['short_answer'],
				newTopics: [],
				subtopics: [],
				responseLength: 'brief',
				confidenceLevel: 'uncertain',
				buzzwords: []
			}

			manager.updateTopicTree(mockState, lowEngagementAnalysis, 'Not much to say', 2)

			// Should navigate to JavaScript sibling
			const currentTopicId = mockState.currentPath[mockState.currentPath.length - 1]
			expect(currentTopicId).toContain('javascript')
		})
	})

	describe('generateTopicTreeState', () => {
		it('should generate tree representation with status emojis', () => {
			// Create a more complex tree
			const analysis: ResponseAnalysis = {
				engagementLevel: 'high',
				exhaustionSignals: [],
				newTopics: ['React', 'JavaScript'],
				subtopics: [],
				responseLength: 'detailed',
				confidenceLevel: 'confident',
				buzzwords: []
			}

			manager.updateTopicTree(mockState, analysis, 'I know React and JavaScript', 1)

			const treeState = manager.generateTopicTreeState(mockState)

			expect(treeState).toContain('🟢 General Background')
			expect(treeState).toContain('⚪ React')
			expect(treeState).toContain('⚪ JavaScript')
			expect(treeState).toContain('← CURRENT')
		})

		it('should show correct depth information', () => {
			const analysis: ResponseAnalysis = {
				engagementLevel: 'high',
				exhaustionSignals: [],
				newTopics: ['React'],
				subtopics: [],
				responseLength: 'detailed',
				confidenceLevel: 'confident',
				buzzwords: []
			}

			manager.updateTopicTree(mockState, analysis, 'I know React', 1)

			const treeState = manager.generateTopicTreeState(mockState)

			expect(treeState).toContain('(depth: 0)')
			expect(treeState).toContain('(depth: 1)')
		})
	})

	describe('getCurrentPath', () => {
		it('should return current path as string', () => {
			const analysis: ResponseAnalysis = {
				engagementLevel: 'high',
				exhaustionSignals: [],
				newTopics: ['React'],
				subtopics: [],
				responseLength: 'detailed',
				confidenceLevel: 'confident',
				buzzwords: []
			}

			manager.updateTopicTree(mockState, analysis, 'I know React', 1)

			const currentPath = manager.getCurrentPath(mockState)
			expect(currentPath).toContain('General Background')
			expect(currentPath).toContain('React')
		})
	})

	describe('getExhaustedTopics', () => {
		it('should return exhausted topics as string', () => {
			const analysis: ResponseAnalysis = {
				engagementLevel: 'low',
				exhaustionSignals: ['short_answer'],
				newTopics: [],
				subtopics: [],
				responseLength: 'brief',
				confidenceLevel: 'uncertain',
				buzzwords: []
			}

			manager.updateTopicTree(mockState, analysis, 'I don\'t know', 1)

			const exhaustedTopics = manager.getExhaustedTopics(mockState)
			expect(exhaustedTopics).toContain('General Background')
		})
	})

	describe('serializeTopicTreeState', () => {
		it('should serialize state for database storage', () => {
			const serialized = manager.serializeTopicTreeState(mockState)

			expect(serialized.topicTree).toBeDefined()
			expect(serialized.currentPath).toEqual(['root'])
			expect(serialized.exhaustedTopics).toEqual([])
			expect(serialized.startTime).toBeDefined()
			expect(serialized.totalDepth).toBe(0)
			expect(serialized.maxDepthReached).toBe(0)
		})
	})

	describe('deserializeTopicTreeState', () => {
		it('should deserialize state from database', () => {
			const serialized = manager.serializeTopicTreeState(mockState)
			const deserialized = manager.deserializeTopicTreeState(serialized)

			expect(deserialized.topicTree.size).toBe(1)
			expect(deserialized.currentPath).toEqual(['root'])
			expect(deserialized.exhaustedTopics).toEqual([])
			expect(deserialized.grades).toEqual([])
			expect(deserialized.buzzwords.size).toBe(0)
		})

		it('should handle buzzwords with sources correctly', () => {
			const dataWithBuzzwords = {
				topicTree: {},
				currentPath: ['root'],
				exhaustedTopics: [],
				grades: [],
				buzzwords: {
					'react': { count: 3, sources: [1, 2, 3] },
					'javascript': { count: 2, sources: [1, 2] }
				},
				startTime: '2024-01-01T10:00:00Z',
				totalDepth: 0,
				maxDepthReached: 0
			}

			const deserialized = manager.deserializeTopicTreeState(dataWithBuzzwords)

			expect(deserialized.buzzwords.size).toBe(2)
			expect(deserialized.buzzwords.get('react')?.count).toBe(3)
			expect(deserialized.buzzwords.get('react')?.sources).toEqual(new Set([1, 2, 3]))
		})
	})
})
