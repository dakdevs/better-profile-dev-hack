import { NextRequest, NextResponse } from 'next/server'

import { serverConfig } from '~/config/server-config'

// Minimal logger to mirror existing behavior
const logger = {
	info: (...args: any[]) => console.log('[INFO]', ...args),
	error: (...args: any[]) => console.error('[ERROR]', ...args),
}

// Types used by extraction
type ExtractedSkill = {
	name: string
	category?: string
	confidence?: number
}

type ExtractionResult = {
	skills: ExtractedSkill[]
	totalSkillsFound: number
	meta?: Record<string, any>
}

// Single-file service with the same API surface (caching removed)
class SkillExtractionService {
	async extractSkills(
		text: string,
		source: 'interview' | 'resume' | 'profile',
	): Promise<ExtractionResult> {
		const result = await this.extractWithAI(text, source)

		logger.info('Skill extraction completed', {
			totalSkillsFound: result.totalSkillsFound,
			sample: result.skills.slice(0, 5).map((s) => s.name),
		})

		return result
	}

	private async extractWithAI(text: string, source: string): Promise<ExtractionResult> {
		const prompt = this.buildSkillExtractionPrompt(text, source)

		const apiKey = serverConfig.openRouter.apiKey
		const apiUrl = 'https://openrouter.ai/api/v1/chat/completions'
		if (!apiKey) {
			throw new Error('OPENROUTER_API_KEY is not configured')
		}

		const resp = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
				messages: [
					{
						role: 'system',
						content: 'You are a precise skill extraction engine. Return only JSON.',
					},
					{ role: 'user', content: prompt },
				],
				temperature: 0.1,
			}),
		})

		if (!resp.ok) {
			const textErr = await resp.text().catch(() => '')
			throw new Error(`Moonshot API error: ${resp.status} ${textErr}`)
		}

		const data = await resp.json()
		return this.parseAISkillResponse(data)
	}

	private buildSkillExtractionPrompt(text: string, source: string): string {
		return [
			'Extract skills, technologies, tools, methodologies, and competencies from the following text.',
			'Return strict JSON with shape:',
			'{ "skills": [{ "name": string, "category": string, "confidence": number }], "meta": { "source": string } }',
			`Source: ${source}`,
			'Text:',
			'"""',
			text,
			'"""',
		].join('\n')
	}

	private parseAISkillResponse(aiResponse: any): ExtractionResult {
		let content: string | undefined
		try {
			const candidate =
				aiResponse?.choices?.[0]?.message?.content
				|| aiResponse?.choices?.[0]?.text
				|| aiResponse?.message?.content
				|| aiResponse?.content
			content = typeof candidate === 'string' ? candidate : JSON.stringify(candidate)
		} catch {}

		let parsed: any = {}
		try {
			parsed = content ? JSON.parse(content) : {}
		} catch {
			if (content) {
				const start = content.indexOf('{')
				const end = content.lastIndexOf('}')
				if (start !== -1 && end !== -1 && end > start) {
					try {
						parsed = JSON.parse(content.slice(start, end + 1))
					} catch {
						parsed = {}
					}
				}
			}
		}

		const skillsRaw = Array.isArray(parsed?.skills) ? parsed.skills : []
		const skills: ExtractedSkill[] = skillsRaw
			.filter((s: any) => s && typeof s.name === 'string')
			.map((s: any) => ({
				name: s.name,
				category: s.category,
				confidence: typeof s.confidence === 'number' ? s.confidence : undefined,
			}))

		return {
			skills,
			totalSkillsFound: skills.length,
			meta: { ...(parsed?.meta || {}) },
		}
	}
}

const skillExtractionService = new SkillExtractionService()

export async function POST(req: NextRequest) {
	try {
		const body = await req.json().catch(() => ({}))
		const { userQuery } = body as { userQuery?: string }

		if (!userQuery || typeof userQuery !== 'string') {
			return NextResponse.json(
				{ error: 'userQuery parameter is required and must be a string' },
				{ status: 400 },
			)
		}

		console.log('🔍 Extracting skills from user query:', userQuery)
		const result = await skillExtractionService.extractSkills(userQuery, 'interview')
		console.log(`✅ Extracted ${result.totalSkillsFound} skills from query`)
		console.log('📋 Skills found:', result.skills.map((s) => s.name).join(', '))

		return new NextResponse(null, { status: 204 })
	} catch (error) {
		logger.error('❌ Failed to extract skills from user query:', error)
		return NextResponse.json({ error: 'Failed to extract skills from user query' }, { status: 500 })
	}
}
