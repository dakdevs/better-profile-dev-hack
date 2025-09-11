import { serverConfig } from '~/config/server-config'
import type { JobAnalysisResult } from '~/types/public'

// import {
//   AIProcessingError,
//   ValidationError,
//   ExternalServiceError
// } from '~/lib/errors';
// import { logger, withLogging } from '~/lib/logger';
// import { withRetry, CircuitBreaker } from '~/lib/error-handler';
// import { cache, cacheKeys, cacheTTL, cacheUtils } from '~/lib/cache';
// import { rateLimiters, rateLimit, batchUtils } from '~/lib/rate-limiter';

/**
 * Service for analyzing job postings using AI to extract skills, requirements, and other metadata
 */
export class JobAnalysisService {
	private readonly aiModel = 'gpt-3.5-turbo'
	private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions'
	private readonly maxRetries = 3
	private readonly retryDelay = 1000 // 1 second

	constructor() {
		if (!serverConfig.ai.openRouterApiKey) {
			console.warn('OpenRouter API key not configured. Job analysis will use fallback mode.')
		}
	}

	// NOTE: caching retries later

	async analyzeJobPosting(jobDescription: string, jobTitle?: string): Promise<JobAnalysisResult> {
		if (!serverConfig.ai.openRouterApiKey) {
			console.warn('AI analysis unavailable, using fallback extraction')
			return this.fallbackAnalysis(jobDescription, jobTitle)
		}

		try {
			const prompt = this.buildAnalysisPrompt(jobDescription, jobTitle)
			const response = await fetch(this.apiUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${serverConfig.ai.openRouterApiKey}`,
					'Content-Type': 'application/json',
					'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
					'X-Title': 'Interview Management System',
				},
				body: JSON.stringify({
					model: this.aiModel,
					messages: [{ role: 'user', content: prompt }],
					temperature: 0.1,
					max_tokens: 2000,
				}),
			})

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(
					`AI API call failed: ${String(response.status)} ${response.statusText} - ${errorText}`,
				)
			}

			type AIResponse = {
				choices: Array<{
					message: {
						content: string
					}
				}>
			}
			const data = (await response.json()) as AIResponse
			const content = data.choices[0]?.message?.content
			if (!content) {
				throw new Error('Invalid AI response format')
			}
			return this.parseAIResponse(content)
		} catch (error) {
			console.error('Error in job analysis, using fallback', error)
			return this.fallbackAnalysis(jobDescription, jobTitle)
		}
	}

	private buildAnalysisPrompt(jobDescription: string, jobTitle?: string): string {
		return `
You are an expert job analysis system. Analyze the following job posting and extract structured information in JSON format.

${jobTitle ? `Job Title: ${jobTitle}` : ''}

Job Description:
${jobDescription}

Please extract and return the following information in valid JSON format:

{
  "extractedSkills": [{"name": "string", "confidence": "number", "category": "string"}],
  "requiredSkills": [{"name": "string", "required": "boolean", "category": "string"}],
  "preferredSkills": [{"name": "string", "required": "boolean", "category": "string"}],
  "experienceLevel": "string",
  "salaryRange": {"min": "number | null", "max": "number | null"},
  "keyTerms": ["string"],
  "confidence": "number",
  "summary": "string"
}

Return ONLY the JSON object.`.trim()
	}

	private parseAIResponse(response: string): JobAnalysisResult {
		try {
			const cleanedResponse = response
				.replace(/```json\s*/g, '')
				.replace(/```\s*/g, '')
				.trim()
			const parsed = JSON.parse(cleanedResponse) as JobAnalysisResult
			return parsed
		} catch (err) {
			console.error('Failed to parse AI response', { response, error: err })
			throw new Error('AI returned invalid JSON format')
		}
	}

	private fallbackAnalysis(_jobDescription: string, _jobTitle?: string): JobAnalysisResult {
		console.log('Using fallback analysis for job posting.')
		return {
			extractedSkills: [],
			requiredSkills: [],
			preferredSkills: [],
			experienceLevel: 'mid',
			salaryRange: undefined,
			keyTerms: [],
			confidence: 0.1,
			summary: 'Basic fallback analysis used.',
		}
	}
}

export const jobAnalysisService = new JobAnalysisService()
