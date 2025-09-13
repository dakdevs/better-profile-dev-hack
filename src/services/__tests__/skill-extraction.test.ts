// src/services/__tests__/skill-extraction.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { SkillExtractionService } from '../skill-extraction'

// Mock the AI mastra service
vi.mock('~/ai/mastra', () => ({
	mastra: {
		getAgent: vi.fn()
	}
}))

describe('SkillExtractionService', () => {
	let skillExtractionService: SkillExtractionService
	let mockAgent: any

	beforeEach(async () => {
		skillExtractionService = new SkillExtractionService()
		
		// Mock the AI agent
		mockAgent = {
			generateText: vi.fn()
		}
		
		// Get the mocked mastra
		const { mastra } = await import('~/ai/mastra')
		vi.mocked(mastra.getAgent).mockReturnValue(mockAgent)
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe('AI-powered skill extraction', () => {
		it('should extract skills using AI model', async () => {
			const text = 'I have extensive experience with React development, including building complex component architectures with TypeScript and using Redux for state management.'
			
			const mockAIResponse = {
				text: JSON.stringify({
					skills: [
						{
							name: 'React',
							evidence: 'React development',
							confidence: 0.95
						},
						{
							name: 'TypeScript',
							evidence: 'TypeScript',
							confidence: 0.9
						},
						{
							name: 'Redux',
							evidence: 'Redux for state management',
							confidence: 0.85
						},
						{
							name: 'Component Architecture',
							evidence: 'building complex component architectures',
							confidence: 0.8
						}
					]
				})
			}
			
			mockAgent.generateText.mockResolvedValue(mockAIResponse)
			
			const result = await skillExtractionService.extractSkills(text)
			
			expect(result.skills).toHaveLength(4)
			expect(result.skills[0].name).toBe('React')
			expect(result.skills[0].confidence).toBe(0.95)
			expect(result.skills[1].name).toBe('TypeScript')
			expect(result.skills[2].name).toBe('Redux')
			expect(result.skills[3].name).toBe('Component Architecture')
			
			// Verify AI agent was called correctly
			expect(mockAgent.generateText).toHaveBeenCalledWith({
				messages: [{ role: 'user', content: text }],
				temperature: 0.3,
				maxTokens: 1000
			})
		})

		it('should extract skills with context', async () => {
			const text = 'I also work with Vue.js and have experience with Nuxt.js for SSR applications.'
			const context = 'This is a follow-up question about frontend frameworks.'
			
			const mockAIResponse = {
				text: JSON.stringify({
					skills: [
						{
							name: 'Vue.js',
							evidence: 'Vue.js',
							confidence: 0.9
						},
						{
							name: 'Nuxt.js',
							evidence: 'Nuxt.js for SSR applications',
							confidence: 0.85
						},
						{
							name: 'SSR',
							evidence: 'SSR applications',
							confidence: 0.8
						}
					]
				})
			}
			
			mockAgent.generateText.mockResolvedValue(mockAIResponse)
			
			const result = await skillExtractionService.extractSkills(text, context)
			
			expect(result.skills).toHaveLength(3)
			expect(result.skills[0].name).toBe('Vue.js')
			expect(result.skills[1].name).toBe('Nuxt.js')
			expect(result.skills[2].name).toBe('SSR')
			
			// Verify context was included in the input
			expect(mockAgent.generateText).toHaveBeenCalledWith({
				messages: [{ 
					role: 'user', 
					content: `${context}\n\n${text}` 
				}],
				temperature: 0.3,
				maxTokens: 1000
			})
		})

		it('should handle AI response parsing errors gracefully', async () => {
			const text = 'I work with React and JavaScript'
			
			// Mock invalid JSON response
			const mockAIResponse = {
				text: 'Invalid JSON response'
			}
			
			mockAgent.generateText.mockResolvedValue(mockAIResponse)
			
			const result = await skillExtractionService.extractSkills(text)
			
			// Should return empty results to maintain skill-agnostic approach
			expect(result.skills).toHaveLength(0)
		})

		it('should handle AI service failures gracefully', async () => {
			const text = 'I work with React and JavaScript'
			
			// Mock AI service failure
			mockAgent.generateText.mockRejectedValue(new Error('AI service unavailable'))
			
			const result = await skillExtractionService.extractSkills(text)
			
			// Should return empty results to maintain skill-agnostic approach
			expect(result.skills).toHaveLength(0)
		})

		it('should extract skills with enhanced context awareness', async () => {
			const text = 'I also have experience with Docker and Kubernetes for containerization.'
			const conversationContext = 'We were discussing DevOps and deployment strategies.'
			const previousSkills = ['React', 'TypeScript', 'Node.js']
			
			const mockAIResponse = {
				text: JSON.stringify({
					skills: [
						{
							name: 'Docker',
							evidence: 'Docker',
							confidence: 0.9
						},
						{
							name: 'Kubernetes',
							evidence: 'Kubernetes for containerization',
							confidence: 0.85
						},
						{
							name: 'Containerization',
							evidence: 'containerization',
							confidence: 0.8
						}
					]
				})
			}
			
			mockAgent.generateText.mockResolvedValue(mockAIResponse)
			
			const result = await skillExtractionService.extractSkillsWithContext(
				text, 
				conversationContext,
				previousSkills
			)
			
			expect(result.skills).toHaveLength(3)
			expect(result.skills[0].name).toBe('Docker')
			expect(result.skills[1].name).toBe('Kubernetes')
			expect(result.skills[2].name).toBe('Containerization')
			
			// Verify enhanced context was included
			const expectedInput = `Conversation Context: ${conversationContext}\n\nUser Response: ${text}\n\nPreviously mentioned skills: ${previousSkills.join(', ')}`
			expect(mockAgent.generateText).toHaveBeenCalledWith({
				messages: [{ 
					role: 'user', 
					content: expectedInput 
				}],
				temperature: 0.2,
				maxTokens: 1200
			})
		})
	})

	describe('AI failure handling', () => {
		it('should return empty results when AI fails (skill-agnostic approach)', async () => {
			const text = 'I work with JavaScript, TypeScript, Python, and Java for various projects.'
			
			// Mock AI failure
			mockAgent.generateText.mockRejectedValue(new Error('AI unavailable'))
			
			const result = await skillExtractionService.extractSkills(text)
			
			// Should return empty results to maintain skill-agnostic approach
			expect(result.skills).toHaveLength(0)
		})

	})

	describe('Edge cases', () => {
		it('should handle empty text', async () => {
			const result = await skillExtractionService.extractSkills('')
			
			expect(result.skills).toHaveLength(0)
		})

		it('should handle text with no recognizable skills', async () => {
			const text = 'I like to eat pizza and watch movies.'
			
			// Mock AI to return no skills
			mockAgent.generateText.mockResolvedValue({
				text: JSON.stringify({ skills: [] })
			})
			
			const result = await skillExtractionService.extractSkills(text)
			
			expect(result.skills).toHaveLength(0)
		})

		it('should handle malformed AI response gracefully', async () => {
			const text = 'I work with React and JavaScript'
			
			// Mock malformed JSON response
			const mockAIResponse = {
				text: '{"skills": [{"name": "React", "evidence": "React", "confidence": 0.9}, {"invalid": "object"}]}'
			}
			
			mockAgent.generateText.mockResolvedValue(mockAIResponse)
			
			const result = await skillExtractionService.extractSkills(text)
			
			// Should still extract React from the valid part
			expect(result.skills.length).toBeGreaterThanOrEqual(1)
			expect(result.skills.map(s => s.name)).toContain('React')
		})

		it('should normalize confidence scores', async () => {
			const text = 'I work with React'
			
			// Mock AI response with invalid confidence scores
			const mockAIResponse = {
				text: JSON.stringify({
					skills: [
						{
							name: 'React',
							evidence: 'React',
							confidence: 1.5 // Invalid: > 1
						},
						{
							name: 'JavaScript',
							evidence: 'JavaScript',
							confidence: -0.5 // Invalid: < 0
						}
					]
				})
			}
			
			mockAgent.generateText.mockResolvedValue(mockAIResponse)
			
			const result = await skillExtractionService.extractSkills(text)
			
			expect(result.skills).toHaveLength(2)
			expect(result.skills[0].confidence).toBe(1.0) // Clamped to 1.0
			expect(result.skills[1].confidence).toBe(0.0) // Clamped to 0.0
		})
	})
})
