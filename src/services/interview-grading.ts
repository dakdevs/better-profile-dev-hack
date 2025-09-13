 // src/services/interview-grading.ts

import { serverConfig } from '~/config/server-config'
import type { ResponseAnalysis, SkillExtraction, ResponseGrade, InterviewSummary } from '~/types/interview-grading'
import { mastra } from '~/ai/mastra'

/**
 * Service for analyzing and grading interview responses
 */
export class InterviewGradingService {
	private readonly analysisModel = 'moonshotai/kimi-k2:free'
	private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions'
	private readonly maxRetries = 3
	private readonly retryDelay = 1000 // 1 second

	constructor() {
		if (!serverConfig.ai.openRouterApiKey) {
			console.warn('OpenRouter API key not configured. Interview grading will use fallback mode.')
		}
	}

	/**
	 * Analyze user response for engagement signals and topic extraction
	 */
	async analyzeResponse(userResponse: string): Promise<ResponseAnalysis> {
		try {
			if (!serverConfig.ai.openRouterApiKey) {
				return await this.analyzeResponseFallback(userResponse)
			}

			const response = await fetch(this.apiUrl, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${serverConfig.ai.openRouterApiKey}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: this.analysisModel,
					messages: [
						{ role: 'system', content: this.getResponseAnalysisPrompt() },
						{ role: 'user', content: userResponse }
					],
				}),
			})

			if (!response.ok) {
				console.warn('AI analysis failed, using fallback')
				return await this.analyzeResponseFallback(userResponse)
			}

			const data = await response.json()
			const analysisText = data.choices?.[0]?.message?.content?.trim()

			try {
				const parsed = JSON.parse(analysisText)
				if (!Array.isArray(parsed.buzzwords)) parsed.buzzwords = []
				return parsed
			} catch {
				return await this.analyzeResponseFallback(userResponse)
			}
		} catch (error) {
			console.error('Failed to analyze response:', error)
			return await this.analyzeResponseFallback(userResponse)
		}
	}

	/**
	 * Fallback response analysis using simple heuristics
	 */
	private async analyzeResponseFallback(userResponse: string): Promise<ResponseAnalysis> {
		const text = userResponse.toLowerCase()
		const wordCount = text.split(' ').length

		const exhaustionSignals = []
		if (wordCount < 10) exhaustionSignals.push('short_answer')
		if (text.includes("don't know") || text.includes("not sure")) exhaustionSignals.push('dont_know')
		if (text.includes('i guess') || text.includes('maybe')) exhaustionSignals.push('vague')

		// Use AI agent for topic extraction
		let newTopics: string[] = []
		try {
			const topicAgent = mastra.getAgent('topicExtractionAgent')
			const topicResponse = await topicAgent.generateText({
				messages: [{ role: 'user', content: userResponse }],
				temperature: 0.3,
				maxTokens: 200
			})
			
			const topicsText = topicResponse.text.trim()
			try {
				const topics = JSON.parse(topicsText)
				if (Array.isArray(topics)) {
					newTopics = topics.filter(topic => 
						typeof topic === 'string' && 
						topic.trim().length > 0 &&
						topic.length < 100
					)
				}
			} catch (parseError) {
				console.warn('Failed to parse topics as JSON:', topicsText)
			}
		} catch (error) {
			console.warn('Topic extraction agent failed, using fallback:', error)
			// Fallback to simple regex if agent fails
			newTopics = this.extractTopicsFromText(text)
		}

		return {
			engagementLevel: wordCount > 30 ? 'high' : wordCount > 15 ? 'medium' : 'low',
			exhaustionSignals,
			newTopics,
			subtopics: [],
			responseLength: wordCount > 30 ? 'detailed' : wordCount > 15 ? 'moderate' : 'brief',
			confidenceLevel: exhaustionSignals.length === 0 ? 'confident' : 'uncertain',
			buzzwords: []
		}
	}

	/**
	 * Extract topics from text using pattern matching
	 */
	private extractTopicsFromText(text: string): string[] {
		const topics: string[] = []

		// Domain-agnostic topic indicators
		const topicPatterns = [
			/work(?:ing)?\s+(?:on|with|in)\s+([^,.!?]+)/g,
			/experience\s+(?:with|in)\s+([^,.!?]+)/g,
			/involved\s+in\s+([^,.!?]+)/g,
			/focus(?:ed)?\s+on\s+([^,.!?]+)/g,
			/specialize\s+in\s+([^,.!?]+)/g,
			/background\s+in\s+([^,.!?]+)/g
		]

		topicPatterns.forEach(pattern => {
			let match
			while ((match = pattern.exec(text)) !== null) {
				const topic = match[1].trim()
				if (topic.length > 2 && topic.length < 50) {
					topics.push(topic)
				}
			}
		})

		return topics
	}

	/**
	 * Grade response quality based on analysis
	 */
	async gradeResponse(userResponse: string, analysis: ResponseAnalysis): Promise<number> {
		// Simple scoring based on engagement and depth
		let score = 1.0 // Base score

		if (analysis.engagementLevel === 'high') score += 0.5
		else if (analysis.engagementLevel === 'low') score -= 0.3

		if (analysis.responseLength === 'detailed') score += 0.3
		else if (analysis.responseLength === 'brief') score -= 0.2

		if (analysis.confidenceLevel === 'confident') score += 0.2
		else if (analysis.confidenceLevel === 'struggling') score -= 0.3

		return Math.max(0, Math.min(2.0, score))
	}

	/**
	 * Extract skills from text using AI-powered skill extraction service
	 */
	async extractSkillsFromText(text: string, context?: string): Promise<SkillExtraction[]> {
		try {
			// Import the skill extraction service
			const { skillExtractionService } = await import('~/services/skill-extraction')
			
			// Use the AI-powered skill extraction service
			const result = await skillExtractionService.extractSkills(text, context)
			
			// Convert to the expected format
			return result.skills.map(skill => ({
				skill: skill.name,
				evidence: skill.evidence,
				confidence: skill.confidence
			}))
			
		} catch (error) {
			console.warn('Skill extraction service failed:', error)
			// Return empty result to maintain skill-agnostic approach
			return []
		}
	}

	/**
	 * Extract skills with enhanced context awareness for better accuracy
	 */
	async extractSkillsWithContext(
		text: string, 
		conversationContext?: string,
		previousSkills?: string[]
	): Promise<SkillExtraction[]> {
		try {
			// Import the skill extraction service
			const { skillExtractionService } = await import('~/services/skill-extraction')
			
			// Use the enhanced context-aware skill extraction
			const result = await skillExtractionService.extractSkillsWithContext(
				text, 
				conversationContext,
				previousSkills
			)
			
			// Convert to the expected format
			return result.skills.map(skill => ({
				skill: skill.name,
				evidence: skill.evidence,
				confidence: skill.confidence
			}))
			
		} catch (error) {
			console.warn('Enhanced skill extraction service failed:', error)
			// Return empty result to maintain skill-agnostic approach
			return []
		}
	}


	/**
	 * Generate interview summary from conversation state
	 */
	generateSummaryTree(sessionId: string, state: any): InterviewSummary {
		const totalNodes = state.topicTree ? state.topicTree.size : 0
		const exhaustedTopics = state.exhaustedTopics ? state.exhaustedTopics.length : 0
		
		const topicCoverage = state.topicTree ? {
			explored: Array.from(state.topicTree.values()).filter((n: any) => n.status !== 'unexplored').length,
			rich: Array.from(state.topicTree.values()).filter((n: any) => n.status === 'rich').length,
			exhausted: Array.from(state.topicTree.values()).filter((n: any) => n.status === 'exhausted').length
		} : { explored: 0, rich: 0, exhausted: 0 }

		const summary: InterviewSummary = {
			sessionId,
			startTime: state.startTime,
			endTime: new Date().toISOString(),
			totalNodes,
			maxDepthReached: state.maxDepthReached || 0,
			exhaustedTopics,
			averageScore: state.grades.reduce((sum: number, g: ResponseGrade) => sum + g.score, 0) / state.grades.length || 0,
			topicCoverage,
			buzzwords: this.topBuzzwords(state, 50),
			topicTreeState: this.generateTopicTreeStateString(state)
		}

		console.log('\n🌟 === ADAPTIVE INTERVIEW SUMMARY ===')
		console.log(`📅 Duration: ${state.startTime} → ${summary.endTime}`)
		console.log(`📊 Average Score: ${summary.averageScore.toFixed(2)}/2.0`)
		console.log(`🌳 Topic Tree: ${summary.totalNodes} nodes, max depth ${summary.maxDepthReached}`)
		console.log(`📈 Coverage: ${summary.topicCoverage.explored} explored, ${summary.topicCoverage.rich} rich, ${summary.topicCoverage.exhausted} exhausted`)
		console.log(`🧠 Top Buzzwords:`, summary.buzzwords.slice(0, 20))
		console.log('\n🗺️ TOPIC TREE STRUCTURE:')
		console.log(summary.topicTreeState)
		console.log('=====================================\n')

		return summary
	}

	/**
	 * Generate topic tree state string for display
	 */
	private generateTopicTreeStateString(state: any): string {
		if (!state.topicTree) return ''

		const treeRepresentation: string[] = []

		const traverseNode = (nodeId: string, indent: string = '') => {
			const node = state.topicTree.get(nodeId)
			if (!node) return

			const statusEmojis = {
				'unexplored': '⚪',
				'exploring': '🔵',
				'exhausted': '🔴',
				'rich': '🟢'
			} as const
			const statusEmoji = statusEmojis[node.status as keyof typeof statusEmojis] || '⚪'

			const isCurrentNode = state.currentPath && state.currentPath[state.currentPath.length - 1] === nodeId
			const marker = isCurrentNode ? ' ← CURRENT' : ''

			treeRepresentation.push(`${indent}${statusEmoji} ${node.name} (depth: ${node.depth})${marker}`)

			if (node.children) {
				node.children.forEach((childId: string) => {
					traverseNode(childId, indent + '  ')
				})
			}
		}

		traverseNode('root')
		return treeRepresentation.join('\n')
	}

	/**
	 * Get top buzzwords from conversation state
	 */
	private topBuzzwords(state: any, limit = 50): Array<{ term: string; count: number; sources: number[] }> {
		if (!state.buzzwords) return []
		const arr = [...state.buzzwords.entries()].map(([term, v]: [string, any]) => ({
			term, 
			count: v.count,
			sources: [...v.sources].sort((a: number, b: number) => a - b),
		}))
		arr.sort((a, b) => b.count - a.count || a.term.localeCompare(b.term))
		return arr.slice(0, limit)
	}

	/**
	 * Get the response analysis prompt for AI
	 */
	private getResponseAnalysisPrompt(): string {
		return `
Analyze this user response for engagement signals and topic extraction.

Return JSON with this structure:
{
  "engagementLevel": "high|medium|low",
  "exhaustionSignals": ["short_answer", "repetition", "dont_know", "vague"],
  "newTopics": ["topic1", "topic2"],
  "subtopics": ["subtopic1", "subtopic2"],
  "responseLength": "detailed|moderate|brief",
  "confidenceLevel": "confident|uncertain|struggling"
  "buzzwords": ["term1", "term2", "multi word term 3"]
}

Instructions for "buzzwords":
- Return 3-15 concise, domain-relevant terms/phrases from the response.
- Prefer multi-word technical terms, jargon, or key concepts.
- Include acronyms, frameworks, libraries, methodologies, tools, companies, roles, and metrics if present.
- lowercase all items, remove duplicates, and avoid generic stopwords.

RESPOND WITH ONLY THE JSON OBJECT.
`
	}
}
