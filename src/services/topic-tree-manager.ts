// src/services/topic-tree-manager.ts

import type { ConversationState, TopicNode, ResponseAnalysis } from '~/types/interview-grading'

/**
 * Service for managing topic tree state and navigation
 */
export class TopicTreeManager {
	/**
	 * Initialize topic tree with root node
	 */
	initializeTopicTree(sessionId: string): ConversationState {
		const state: ConversationState = {
			topicTree: new Map(),
			currentPath: [],
			exhaustedTopics: [],
			grades: [],
			buzzwords: new Map(),
			startTime: new Date().toISOString(),
			totalDepth: 0,
			maxDepthReached: 0,
		}

		// Create root node
		const rootNode: TopicNode = {
			id: 'root',
			name: 'General Background',
			depth: 0,
			parentId: null,
			children: [],
			status: 'exploring',
			context: 'Starting conversation',
			mentions: [],
			createdAt: new Date().toISOString()
		}

		state.topicTree.set('root', rootNode)
		state.currentPath = ['root']

		console.log('🌱 Topic tree initialized for session:', sessionId)
		return state
	}

	/**
	 * Update topic tree based on response analysis
	 */

	// TODO: USE AFTER
	updateTopicTree(
		state: ConversationState, 
		analysis: ResponseAnalysis, 
		userResponse: string, 
		messageIndex: number
	): void {
		const currentNodeId = state.currentPath[state.currentPath.length - 1]
		const currentNode = state.topicTree.get(currentNodeId)
		if (!currentNode) return

		// Update current node with new mention
		currentNode.mentions.push({
			messageIndex,
			timestamp: new Date().toISOString(),
			response: userResponse,
			engagementLevel: analysis.engagementLevel
		})

		// Determine next action based on analysis
		const hasExhaustionSignals = analysis.exhaustionSignals && analysis.exhaustionSignals.length > 0
		const isHighEngagement = analysis.engagementLevel === 'high'
		const hasNewTopics = analysis.newTopics && analysis.newTopics.length > 0

		if (hasExhaustionSignals || analysis.engagementLevel === 'low') {
			// Mark current topic as exhausted and backtrack
			currentNode.status = 'exhausted'
			state.exhaustedTopics.push(currentNodeId)

			console.log(`🔄 Topic "${currentNode.name}" marked as exhausted, backtracking...`)

			// Navigate to parent or sibling
			this.navigateToNextTopic(state)

		} else if (isHighEngagement && hasNewTopics) {
			// Create subtopics and go deeper
			currentNode.status = 'rich'

			analysis.newTopics.forEach((topicName: string) => {
				this.createSubtopic(state, currentNodeId, topicName, userResponse)
			})

			// Navigate to first new subtopic
			if (currentNode.children.length > 0) {
				const firstChild = currentNode.children[0]
				state.currentPath.push(firstChild)
				state.maxDepthReached = Math.max(state.maxDepthReached, state.currentPath.length - 1)

				console.log(`🔍 Going deeper: ${state.currentPath.map(id => state.topicTree.get(id)?.name).join(' → ')}`)
			}
		}

		// Update depth tracking
		state.totalDepth = state.currentPath.length - 1
	}

	/**
	 * Create a new subtopic node
	 */

	// TODO: USE AFTER
	private createSubtopic(state: ConversationState, parentId: string, topicName: string, context: string): void {
		const parentNode = state.topicTree.get(parentId)
		if (!parentNode) return

		const subtopicId = `${parentId}_${topicName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`

		const subtopic: TopicNode = {
			id: subtopicId,
			name: topicName,
			depth: parentNode.depth + 1,
			parentId: parentId,
			children: [],
			status: 'unexplored',
			context: context.substring(0, 100),
			mentions: [],
			createdAt: new Date().toISOString()
		}

		state.topicTree.set(subtopicId, subtopic)
		parentNode.children.push(subtopicId)

		console.log(`🌱 New subtopic created: "${topicName}" (depth ${subtopic.depth})`)
	}

	/**
	 * Navigate to next unexplored topic
	 */

	// TODO: USE AFTER
	private navigateToNextTopic(state: ConversationState): void {
		// Try to find unexplored sibling
		const currentNodeId = state.currentPath[state.currentPath.length - 1]
		const currentNode = state.topicTree.get(currentNodeId)

		if (currentNode?.parentId) {
			const parent = state.topicTree.get(currentNode.parentId)
			if (parent) {
				const unexploredSibling = parent.children.find(childId => {
					const child = state.topicTree.get(childId)
					return child && child.status === 'unexplored'
				})

				if (unexploredSibling) {
					// Navigate to sibling
					state.currentPath[state.currentPath.length - 1] = unexploredSibling
					const siblingNode = state.topicTree.get(unexploredSibling)
					console.log(`↔️ Moving to sibling: "${siblingNode?.name}"`)
					return
				}
			}

			// No unexplored siblings, backtrack to parent
			state.currentPath.pop()
			if (state.currentPath.length === 0) {
				state.currentPath = ['root']
			}

			const newCurrentNode = state.topicTree.get(state.currentPath[state.currentPath.length - 1])
			console.log(`⬆️ Backtracked to: "${newCurrentNode?.name}"`)
		}
	}

	/**
	 * Generate topic tree state representation for prompts
	 */

	// TODO: USE AFTER
	generateTopicTreeState(state: ConversationState): string {
		const treeRepresentation: string[] = []

		const traverseNode = (nodeId: string, indent: string = '') => {
			const node = state.topicTree.get(nodeId)
			if (!node) return

			const statusEmoji = {
				'unexplored': '⚪',
				'exploring': '🔵',
				'exhausted': '🔴',
				'rich': '🟢'
			}[node.status]

			const isCurrentNode = state.currentPath[state.currentPath.length - 1] === nodeId
			const marker = isCurrentNode ? ' ← CURRENT' : ''

			treeRepresentation.push(`${indent}${statusEmoji} ${node.name} (depth: ${node.depth})${marker}`)

			node.children.forEach(childId => {
				traverseNode(childId, indent + '  ')
			})
		}

		traverseNode('root')
		return treeRepresentation.join('\n')
	}

	/**
	 * Get current topic path as string
	 */

	// TODO: USE AFTER
	getCurrentPath(state: ConversationState): string {
		return state.currentPath.map(id => state.topicTree.get(id)?.name).join(' → ')
	}

	/**
	 * Get exhausted topics as string
	 */

	// TODO: USE AFTER
	getExhaustedTopics(state: ConversationState): string {
		return state.exhaustedTopics.map(id => state.topicTree.get(id)?.name).join(', ')
	}

	/**
	 * Serialize topic tree state for database storage
	 */

	// TODO: USE AFTER
	serializeTopicTreeState(state: ConversationState): any {
		return {
			topicTree: Object.fromEntries(state.topicTree),
			currentPath: state.currentPath,
			exhaustedTopics: state.exhaustedTopics,
			startTime: state.startTime,
			totalDepth: state.totalDepth,
			maxDepthReached: state.maxDepthReached
		}
	}

	/**
	 * Deserialize topic tree state from database
	 */

	// TODO: USE AFTER
	deserializeTopicTreeState(data: any): ConversationState {
		const state: ConversationState = {
			topicTree: new Map(Object.entries(data.topicTree || {})),
			currentPath: data.currentPath || ['root'],
			exhaustedTopics: data.exhaustedTopics || [],
			grades: data.grades || [],
			buzzwords: new Map(Object.entries(data.buzzwords || {})),
			startTime: data.startTime || new Date().toISOString(),
			totalDepth: data.totalDepth || 0,
			maxDepthReached: data.maxDepthReached || 0,
		}

		// Convert buzzwords sources back to Sets
		for (const [term, data] of state.buzzwords.entries()) {
			if (data && typeof data === 'object' && 'sources' in data) {
				state.buzzwords.set(term, {
					count: data.count,
					sources: new Set(data.sources)
				})
			}
		}

		return state
	}
}
