const RESPONSE_ANALYSIS_PROMPT = `
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
`;

const ANALYSIS_MODEL = 'moonshotai/kimi-k2:free';


async function analyzeResponse(userResponse: string): Promise<any> {
	try {
		const apiKey = process.env.OPENROUTER_API_KEY;
		if (!apiKey) return null;

		const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model: ANALYSIS_MODEL,
				messages: [
					{ role: 'system', content: RESPONSE_ANALYSIS_PROMPT },
					{ role: 'user', content: userResponse }
				],
			}),
		});

		if (!response.ok) return null;

		const data = await response.json();
		const analysisText = data.choices?.[0]?.message?.content?.trim();

		try {
			const parsed = JSON.parse(analysisText);
			if (!Array.isArray(parsed.buzzwords)) parsed.buzzwords = [];
			return parsed;
		} catch {
			// Fallback analysis
			return analyzeResponseFallback(userResponse);
		}
	} catch (error) {
		console.error('❌ Failed to analyze response:', error);
		return analyzeResponseFallback(userResponse);
	}
}

function analyzeResponseFallback(userResponse: string): any {
	const text = userResponse.toLowerCase();
	const wordCount = text.split(' ').length;

	const exhaustionSignals = [];
	if (wordCount < 10) exhaustionSignals.push('short_answer');
	if (text.includes("don't know") || text.includes("not sure")) exhaustionSignals.push('dont_know');
	if (text.includes('i guess') || text.includes('maybe')) exhaustionSignals.push('vague');

	return {
		engagementLevel: wordCount > 30 ? 'high' : wordCount > 15 ? 'medium' : 'low',
		exhaustionSignals,
		newTopics: extractTopicsFromText(text),
		subtopics: [],
		responseLength: wordCount > 30 ? 'detailed' : wordCount > 15 ? 'moderate' : 'brief',
		confidenceLevel: exhaustionSignals.length === 0 ? 'confident' : 'uncertain',
		buzzwords: [] // ADD
	};
}

function extractTopicsFromText(text: string): string[] {
	const topics: string[] = [];

	// Domain-agnostic topic indicators
	const topicPatterns = [
		/work(?:ing)?\s+(?:on|with|in)\s+([^,.!?]+)/g,
		/experience\s+(?:with|in)\s+([^,.!?]+)/g,
		/involved\s+in\s+([^,.!?]+)/g,
		/focus(?:ed)?\s+on\s+([^,.!?]+)/g,
		/specialize\s+in\s+([^,.!?]+)/g,
		/background\s+in\s+([^,.!?]+)/g
	];

	topicPatterns.forEach(pattern => {
		let match;
		while ((match = pattern.exec(text)) !== null) {
			const topic = match[1].trim();
			if (topic.length > 2 && topic.length < 50) {
				topics.push(topic);
			}
		}
	});

	return topics;
}

async function gradeResponse(userResponse: string, analysis: any): Promise<number> {
	// Simple scoring based on engagement and depth
	let score = 1.0; // Base score

	if (analysis.engagementLevel === 'high') score += 0.5;
	else if (analysis.engagementLevel === 'low') score -= 0.3;

	if (analysis.responseLength === 'detailed') score += 0.3;
	else if (analysis.responseLength === 'brief') score -= 0.2;

	if (analysis.confidenceLevel === 'confident') score += 0.2;
	else if (analysis.confidenceLevel === 'struggling') score -= 0.3;

	return Math.max(0, Math.min(2.0, score));
}


async function createSkillMention(params: {
	userSkillId: string;
	userId: string;
	sessionId?: string | null;
	messageIndex?: number | null;
	mentionText?: string | null;
	confidence?: number | null;
	engagementLevel?: string | null;
	topicDepth?: number | null;
	conversationContext?: string | null;
}) {
	try {
		console.log('💾 Inserting skill mention for user skill:', params.userSkillId);
		const inserted = await db.insert(skillMentions).values({
			userSkillId: params.userSkillId,
			userId: params.userId,
			sessionId: params.sessionId ?? null,
			messageIndex: params.messageIndex ?? null,
			mentionText: params.mentionText ?? null,
			confidence: params.confidence != null ? String(params.confidence) : null,
			engagementLevel: params.engagementLevel ?? null,
			topicDepth: params.topicDepth != null ? String(params.topicDepth) : null,
			conversationContext: params.conversationContext ?? null,
		}).returning();

		console.log('✅ Skill mention inserted with id:', inserted[0].id);
		return inserted[0];
	} catch (error) {
		console.error('❌ Failed to insert skill mention:', error);
		throw error;
	}
}
