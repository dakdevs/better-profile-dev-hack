import { generateObject } from 'ai'
import z from 'zod'

const RESPONSE_ANALYSIS_PROMPT = `
You are a strict JSON function. Analyze the user's message for engagement and topic extraction.

Output only a single JSON object that matches EXACTLY this shape and enums:
{
  "engagementLevel": "high|medium|low",
  "exhaustionSignals": ["short_answer", "repetition", "dont_know", "vague"],
  "newTopics": ["topic1"],
  "subtopics": ["subtopic1"],
  "responseLength": "detailed|moderate|brief",
  "confidenceLevel": "confident|uncertain|struggling",
  "buzzwords": ["term1", "term two", "multi word term"]
}

Formatting and validation rules (must follow all):
- Return ONLY a JSON object. No markdown, no code fences, no explanations, no trailing commas.
- All array items must be unique, trimmed, and lowercase.
- If a field has no items, return an empty array []. Do NOT use null/undefined.
- Use ONLY the enum values shown above for "engagementLevel", "responseLength", and "confidenceLevel".
- Use ONLY the allowed codes for "exhaustionSignals": short_answer, repetition, dont_know, vague.
- If uncertain, choose the closest valid enum; never invent new keys or values.

Decision rubric:
- engagementLevel:
  - high: specific, substantive, on-topic details (examples, metrics, concrete actions), coherent flow, minimal hedging.
  - medium: some specifics but limited depth OR moderate hedging.
  - low: very short, vague, off-topic, or explicitly "don't know".
- responseLength (heuristic, but do not include counts in output):
  - detailed: typically >= ~80 words OR multiple rich sentences with examples/metrics.
  - moderate: ~20-79 words OR some specifics without depth.
  - brief: < ~20 words OR one short sentence/fragment.
- confidenceLevel:
  - confident: strong, direct statements; clear ownership of results; minimal hedging.
  - uncertain: noticeable hedging (e.g., "maybe", "I think", "probably"), soft language.
  - struggling: explicit confusion or inability to answer (e.g., "don't know", "not sure").
- exhaustionSignals (choose zero or more):
  - short_answer: extremely short reply (e.g., single short sentence or < ~12 words).
  - repetition: repeated phrases/ideas without added substance.
  - dont_know: expresses not knowing or inability to answer.
  - vague: hedging/filler with low specificity (e.g., "maybe", "kind of", "sort of").

Topic extraction:
- newTopics: 0-6 concise noun-phrases representing distinct high-level subjects present in the message.
  - 1-5 words each; avoid function words; no punctuation except hyphens; must come from the message.
  - Prefer domain terms over generic words (e.g., "vector databases" vs "databases").
- subtopics: 0-8 narrower aspects/components/examples tied to the above topics, present in the message.
  - 1-6 words each; avoid stopwords; must come from the message.

Buzzwords extraction:
- Return 3-15 concise, domain-relevant terms actually mentioned or unambiguously implied by the message.
- Prefer multi-word technical terms, frameworks, libraries, methodologies, tools, roles, companies, metrics, standards, acronyms.
- Lowercase all; deduplicate strictly; remove generic stopwords; exclude pure numbers, dates, and pronouns.

Quality constraints:
- Do not hallucinate topics or buzzwords that are not present.
- Do not copy full sentences; extract compact noun-phrases.
- Be conservative when evidence is weak.

Respond with ONLY the JSON object.`

const ANALYSIS_SCHEMA = z.object({
	engagementLevel: z.enum(['high', 'medium', 'low']),
	exhaustionSignals: z.array(z.enum(['short_answer', 'repetition', 'dont_know', 'vague'])),
	newTopics: z.array(z.string()),
	subtopics: z.array(z.string()),
	responseLength: z.enum(['detailed', 'moderate', 'brief']),
	confidenceLevel: z.enum(['confident', 'uncertain', 'struggling']),
	buzzwords: z.array(z.string()),
})

export async function analyzeResponse(userResponse: string) {
	const result = await generateObject({
		model: 'openai/gpt-5-mini',
		system: RESPONSE_ANALYSIS_PROMPT,
		prompt: userResponse,
		schema: ANALYSIS_SCHEMA,
	})

	const grade = gradeResponse(result.object)

	return {
		analysis: result.object,
		grade,
	}
}

function gradeResponse(analysis: z.output<typeof ANALYSIS_SCHEMA>) {
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
