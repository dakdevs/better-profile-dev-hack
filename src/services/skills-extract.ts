import { serverConfig } from '~/config/server-config'

// Minimal logger to mirror existing behavior
const logger = {
	info: (...args: unknown[]) => {
		console.log('[INFO]', ...args)
	},
	error: (...args: unknown[]) => {
		console.error('[ERROR]', ...args)
	},
}

// Narrowing helpers
function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

type RawSkill = {
	name: string
	category?: unknown
	confidence?: unknown
}

function isRawSkill(value: unknown): value is RawSkill {
	return isRecord(value) && typeof value['name'] === 'string'
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
	meta?: Record<string, unknown>
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
				model: 'openai/gpt-4o-mini',
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
			throw new Error(`Moonshot API error: ${String(resp.status)} ${textErr}`)
		}

		const data: unknown = await resp.json()

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

	private parseAISkillResponse(aiResponse: unknown): ExtractionResult {
		let content: string | undefined
		try {
			if (isRecord(aiResponse)) {
				const choicesVal = aiResponse['choices']
				if (Array.isArray(choicesVal) && choicesVal.length > 0) {
					const first: unknown = choicesVal[0]
					if (isRecord(first)) {
						const messageVal = first['message']
						const message = isRecord(messageVal) ? messageVal : undefined
						const rawMsgContent = message?.['content']
						const messageContent = typeof rawMsgContent === 'string' ? rawMsgContent : undefined
						const rawText = first['text']
						const text = typeof rawText === 'string' ? rawText : undefined
						content = messageContent ?? text
					}
				}

				if (!content) {
					const msgVal = aiResponse['message']
					const message = isRecord(msgVal) ? msgVal : undefined
					const rawMsgContent = message?.['content']
					const messageContent = typeof rawMsgContent === 'string' ? rawMsgContent : undefined
					const rawTop = aiResponse['content']
					const topContent = typeof rawTop === 'string' ? rawTop : undefined
					content = messageContent ?? topContent
				}
			}

			if (!content) {
				content = JSON.stringify(aiResponse)
			}
		} catch (err) {
			logger.error('Failed to read AI response content', err)
		}

		let parsed: unknown = {}
		try {
			parsed = content ? JSON.parse(content) : {}
		} catch {
			if (content) {
				const start = content.indexOf('{')
				const end = content.lastIndexOf('}')
				if (start !== -1 && end !== -1 && end > start) {
					try {
						parsed = JSON.parse(content.slice(start, end + 1))
					} catch (err) {
						parsed = {}
						logger.error('Failed to parse AI JSON after slicing', err)
					}
				}
			}
		}

		let skills: ExtractedSkill[] = []
		let meta: Record<string, unknown> | undefined
		if (isRecord(parsed)) {
			const skillsRaw = Array.isArray(parsed['skills']) ? (parsed['skills'] as unknown[]) : []
			skills = skillsRaw
				.filter((s: unknown): s is RawSkill => isRawSkill(s))
				.map((s) => {
					const name = s.name
					const category = typeof s.category === 'string' ? s.category : undefined
					const confidence = typeof s.confidence === 'number' ? s.confidence : undefined

					return { name, category, confidence }
				})

			if (isRecord(parsed['meta'])) {
				meta = parsed['meta']
			}
		}

		return {
			skills,
			totalSkillsFound: skills.length,
			meta,
		}
	}
}

const skillExtractionService = new SkillExtractionService()

export async function extractSkills(userQuery: string) {
	const result = await skillExtractionService.extractSkills(userQuery, 'interview')

	return result
}
