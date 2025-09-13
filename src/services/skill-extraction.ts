// src/services/skill-extraction.ts

import { mastra } from '~/ai/mastra'

export interface SkillExtractionResult {
	skills: Array<{
		name: string
		evidence: string
		confidence: number
	}>
}

export interface SkillExtraction {
	skill: string
	evidence: string
	confidence: number
}

export class SkillExtractionService {
	/**
	 * Extract skills from text using AI model
	 * This method is skill-agnostic and can identify any relevant skills mentioned
	 */

	// TODO: USE AFTER
	async extractSkills(text: string, context?: string): Promise<SkillExtractionResult> { 
		// Handle empty or very short text
		if (!text || text.trim().length < 3) {
			return { skills: [] }
		}
		
		try {
			// Use AI agent for skill extraction
			const skillAgent = mastra.getAgent('skillExtractionAgent')
			
			// Prepare the input text with optional context
			const inputText = context ? `${context}\n\n${text}` : text
			
			const skillResponse = await skillAgent.generateText({
				messages: [{ 
					role: 'user', 
					content: inputText 
				}],
				temperature: 0.3,
				maxTokens: 1000
			})
			
			const skillsText = skillResponse.text.trim()
			
			// Parse the JSON response
			const parsed = JSON.parse(skillsText)
			
			if (parsed.skills && Array.isArray(parsed.skills)) {
				return {
					skills: parsed.skills.map((skill: any) => ({
						name: skill.name || skill.skill || '',
						evidence: skill.evidence || '',
						confidence: Math.max(0, Math.min(1, skill.confidence || 0.5))
					}))
				}
			}
			
			return { skills: [] }
			
		} catch (error) {
			console.warn('AI skill extraction failed:', error)
			// Return empty result instead of using pattern-based fallback
			// to maintain skill-agnostic approach
			return { skills: [] }
		}
	}


	/**
	 * Extract skills with enhanced context awareness
	 * This method provides additional context to help the AI understand the conversation better
	 */

	// TODO: USE AFTER
	async extractSkillsWithContext(
		text: string, 
		conversationContext?: string,
		previousSkills?: string[]
	): Promise<SkillExtractionResult> {
		try {
			const skillAgent = mastra.getAgent('skillExtractionAgent')
			
			// Build enhanced context
			let enhancedInput = text
			
			if (conversationContext) {
				enhancedInput = `Conversation Context: ${conversationContext}\n\nUser Response: ${text}`
			}
			
			if (previousSkills && previousSkills.length > 0) {
				enhancedInput += `\n\nPreviously mentioned skills: ${previousSkills.join(', ')}`
			}
			
			const skillResponse = await skillAgent.generateText({
				messages: [{ 
					role: 'user', 
					content: enhancedInput 
				}],
				temperature: 0.2, // Lower temperature for more consistent results
				maxTokens: 1200
			})
			
			const skillsText = skillResponse.text.trim()
			const parsed = JSON.parse(skillsText)
			
			if (parsed.skills && Array.isArray(parsed.skills)) {
				return {
					skills: parsed.skills.map((skill: any) => ({
						name: skill.name || skill.skill || '',
						evidence: skill.evidence || '',
						confidence: Math.max(0, Math.min(1, skill.confidence || 0.5))
					}))
				}
			}
			
			return { skills: [] }
			
		} catch (error) {
			console.warn('Enhanced AI skill extraction failed:', error)
			// Return empty result instead of using pattern-based fallback
			// to maintain skill-agnostic approach
			return { skills: [] }
		}
	}
}

export const skillExtractionService = new SkillExtractionService()

