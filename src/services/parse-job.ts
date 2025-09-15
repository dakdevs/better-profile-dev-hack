import { NextResponse } from 'next/server'
import { convert } from 'html-to-text'
import { z } from 'zod'

import { serverConfig } from '~/config/server-config'

interface JobAnalysisResult {
	extractedSkills: ExtractedSkill[]
	requiredSkills: Skill[]
	preferredSkills: Skill[]
	experienceLevel?: ExperienceLevel
	salaryRange?: {
		min?: number
		max?: number
	}
	keyTerms: string[]
	confidence: number
	summary?: string
}

interface ExtractedSkill {
	name: string
	confidence: number
	category: SkillCategory
	synonyms?: string[]
	context?: string
}

interface Skill {
	name: string
	proficiencyScore?: number
	required?: boolean
	category?: SkillCategory
}

type SkillCategory = 'technical' | 'soft' | 'domain' | 'language' | 'certification'
type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive' | 'intern'

export class JobAnalysisService {
	private readonly aiModel = 'gpt-3.5-turbo'
	private readonly apiUrl = 'https://openrouter.ai/api/v1/chat/completions'
	private readonly maxRetries = 3
	private readonly retryDelay = 1000 // 1 second

	constructor() {
		if (!serverConfig.openRouter.apiKey) {
			throw new Error('OpenRouter API key not configured')
		}
	}

	// NOTE: caching retries later

	async analyzeJobPosting(jobDescription: string, jobTitle?: string): Promise<JobAnalysisResult> {
		try {
			const prompt = this.buildAnalysisPrompt(jobDescription, jobTitle)
			const response = await fetch(this.apiUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${serverConfig.openRouter.apiKey}`,
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
			console.error('Error in job analysis:', error)
			throw error
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
}

export function turnUrlToJsonUrl(url: string): string {
	if (!url.includes('greenhouse.io')) {
		return ''
	}

	const regex = /greenhouse\.io\/([^/]+)\/jobs\/(\d+)|greenhouse\.io\/jobs\/(\d+)/
	const match = url.match(regex)

	if (!match) {
		throw new Error('Could not parse the company name or job ID from the Greenhouse URL.')
	}

	// If the 1st capture group exists, use it as the company name. Otherwise, default to 'greenhouse'.
	const companyName = match[1] || 'greenhouse'

	// The job ID will be in either the 2nd or 3rd capture group, depending on which pattern matched.
	const jobId = match[2] || match[3]

	return `https://boards-api.greenhouse.io/v1/boards/${companyName}/jobs/${jobId}?questions=true&pay_transparency=true`
}

export function stripHtmlTags(html: string): string {
	if (!html || typeof html !== 'string') {
		return ''
	}

	// First pass: Use html-to-text for comprehensive conversion
	const basicText = convert(html, {
		wordwrap: false,
		preserveNewlines: false,
		selectors: [
			// Remove unwanted elements completely
			{ selector: 'script', format: 'skip' },
			{ selector: 'style', format: 'skip' },
			{ selector: 'noscript', format: 'skip' },
			{ selector: 'iframe', format: 'skip' },
			{ selector: 'object', format: 'skip' },
			{ selector: 'embed', format: 'skip' },

			// Convert structural elements to text with spacing
			{ selector: 'h1', format: 'block', options: { leadingLineBreaks: 2, trailingLineBreaks: 1 } },
			{ selector: 'h2', format: 'block', options: { leadingLineBreaks: 2, trailingLineBreaks: 1 } },
			{ selector: 'h3', format: 'block', options: { leadingLineBreaks: 2, trailingLineBreaks: 1 } },
			{ selector: 'h4', format: 'block', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
			{ selector: 'h5', format: 'block', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
			{ selector: 'h6', format: 'block', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
			{ selector: 'p', format: 'block', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
			{
				selector: 'div',
				format: 'block',
				options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
			},
			{ selector: 'br', format: 'lineBreak' },

			// Lists
			{ selector: 'ul', format: 'block', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
			{ selector: 'ol', format: 'block', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
			{
				selector: 'li',
				format: 'block',
				options: { itemPrefix: '• ', leadingLineBreaks: 0, trailingLineBreaks: 0 },
			},

			// Inline elements - just extract text
			{ selector: 'strong', format: 'inline' },
			{ selector: 'b', format: 'inline' },
			{ selector: 'em', format: 'inline' },
			{ selector: 'i', format: 'inline' },
			{ selector: 'span', format: 'inline' },
			{ selector: 'a', format: 'inline' },
			{ selector: 'code', format: 'inline' },
			{ selector: 'kbd', format: 'inline' },
			{ selector: 'samp', format: 'inline' },
			{ selector: 'var', format: 'inline' },
			{ selector: 'mark', format: 'inline' },
			{ selector: 'small', format: 'inline' },
			{ selector: 'sub', format: 'inline' },
			{ selector: 'sup', format: 'inline' },
		],
	})

	// Second pass: Aggressive HTML tag removal with multiple regex passes
	let cleanText = basicText

	// Remove any remaining HTML tags (multiple passes to catch nested tags)
	for (let i = 0; i < 5; i++) {
		cleanText = cleanText.replace(/<[^>]*>/g, '')
	}

	// Remove HTML entities
	cleanText = cleanText
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&#x27;/g, "'")
		.replace(/&apos;/g, "'")
		.replace(/&hellip;/g, '...')
		.replace(/&mdash;/g, '—')
		.replace(/&ndash;/g, '–')
		.replace(/&rsquo;/g, "'")
		.replace(/&lsquo;/g, "'")
		.replace(/&rdquo;/g, '"')
		.replace(/&ldquo;/g, '"')
		.replace(/&copy;/g, '©')
		.replace(/&reg;/g, '®')
		.replace(/&trade;/g, '™')
		.replace(/&deg;/g, '°')
		.replace(/&plusmn;/g, '±')
		.replace(/&times;/g, '×')
		.replace(/&divide;/g, '÷')

	// Remove any remaining HTML entities (numeric)
	cleanText = cleanText.replace(/&#\d+;/g, '')
	cleanText = cleanText.replace(/&#x[0-9a-fA-F]+;/g, '')

	// Third pass: Clean up whitespace and formatting
	cleanText = cleanText
		.replace(/\r\n/g, '\n') // Normalize line endings
		.replace(/\r/g, '\n')
		.replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
		.replace(/[ \t]{2,}/g, ' ') // Replace multiple spaces/tabs with single space
		.replace(/^\s+|\s+$/gm, '') // Trim whitespace from each line
		.replace(/\n\s*\n/g, '\n\n') // Clean up empty lines
		.trim() // Trim overall

	return cleanText
}
export function extractAndClean(data: any): string {
	const htmlToConvert = data.content || data.description || data.job_description || ''

	if (!htmlToConvert) {
		return ''
	}

	// Use the improved HTML stripping function
	const descriptionText = stripHtmlTags(htmlToConvert)

	const title = data.title || ''
	const location = data.location?.name || ''
	const company = data.company || data.company_name || ''

	const header = [
		title,
		company ? `Company: ${company}` : '',
		location ? `Location: ${location}` : '',
	]
		.filter(Boolean)
		.join('\n')

	return `${header}\n\n${descriptionText}`.trim()
}

const schema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('url'),
		jobUrl: z.url('Job URL is required'),
	}),
	z.object({
		type: z.literal('description'),
		jobTitle: z.string().min(1, 'Job title is required'),
		jobDescription: z.string().min(1, 'Job description is required'),
	}),
])

type ParseJobInput = z.input<typeof schema>

export default async function parseJob(input: ParseJobInput) {
	if (input.type === 'url') {
		const { jobUrl } = input

		const jsonUrl = turnUrlToJsonUrl(jobUrl)
		if (jsonUrl) {
			const response = await fetch(jsonUrl)

			if (!response.ok) {
				return null
			}

			const data = await response.json()

			const jobDescription = extractAndClean(data)
			const jobTitle = data.title

			const jobAnalysisService = new JobAnalysisService()

			const result = await jobAnalysisService.analyzeJobPosting(jobDescription, jobTitle)

			return {
				result,
				jobTitle,
				jobDescription,
			}
		} else {
			return null
		}
	} else if (input.type === 'description') {
		const { jobTitle, jobDescription } = input

		const jobAnalysisService = new JobAnalysisService()
		const result = await jobAnalysisService.analyzeJobPosting(jobDescription, jobTitle)

		return {
			result,
			jobTitle,
			jobDescription,
		}
	}

	return null
}
