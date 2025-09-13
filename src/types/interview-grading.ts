// src/types/interview-grading.ts

export interface ResponseAnalysis {
	engagementLevel: 'high' | 'medium' | 'low'
	exhaustionSignals: string[]
	newTopics: string[]
	subtopics: string[]
	responseLength: 'detailed' | 'moderate' | 'brief'
	confidenceLevel: 'confident' | 'uncertain' | 'struggling'
	buzzwords: string[]
}

export interface SkillExtraction {
	skill: string
	evidence: string
	confidence: number
}

export interface ResponseGrade {
	messageIndex: number
	score: number
	timestamp: string
	content: string
	engagementLevel: string
}

export interface BuzzwordData {
	count: number
	sources: Set<number>
}

export interface TopicNode {
	id: string
	name: string
	depth: number
	parentId: string | null
	children: string[]
	status: 'unexplored' | 'exploring' | 'exhausted' | 'rich'
	context: string
	mentions: Array<{
		messageIndex: number
		timestamp: string
		response: string
		engagementLevel: string
	}>
	createdAt: string
}

export interface ConversationState {
	topicTree: Map<string, TopicNode>
	currentPath: string[]
	exhaustedTopics: string[]
	grades: ResponseGrade[]
	buzzwords: Map<string, BuzzwordData>
	startTime: string
	totalDepth: number
	maxDepthReached: number
}

export interface InterviewSummary {
	sessionId: string
	startTime: string
	endTime: string
	totalNodes: number
	maxDepthReached: number
	exhaustedTopics: number
	averageScore: number
	topicCoverage: {
		explored: number
		rich: number
		exhausted: number
	}
	buzzwords: Array<{
		term: string
		count: number
		sources: number[]
	}>
	topicTreeState: string
}
