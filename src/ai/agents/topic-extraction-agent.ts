// src/ai/agents/topic-extraction-agent.ts

import { Agent } from '@mastra/core'
import { openrouter } from '~/ai/lib/openrouter'

const MODEL = openrouter('google/gemini-2.5-flash')

const INSTRUCTIONS = `You are an expert at extracting topics and themes from conversational text. Your job is to identify the main topics, subjects, or areas of expertise mentioned in user responses.

INSTRUCTIONS:
1. Extract 1-5 relevant topics from the text
2. Focus on professional skills, technologies, domains, or areas of knowledge
3. Be specific but not overly granular
4. Return topics as they naturally appear in the text (preserve capitalization)
5. Avoid generic topics like "work" or "experience"
6. If no clear topics are mentioned, return an empty array

EXAMPLES:
Input: "I have extensive experience with React development, including building complex component architectures"
Output: ["React development", "component architecture"]

Input: "I work with JavaScript, TypeScript, and Node.js for backend development"
Output: ["JavaScript", "TypeScript", "Node.js", "backend development"]

Input: "I don't know much about that"
Output: []

RESPOND WITH ONLY A JSON ARRAY OF TOPICS. NO OTHER TEXT.`

export const topicExtractionAgent = new Agent({
	name: 'Topic Extraction Agent',
	instructions: INSTRUCTIONS,
	model: MODEL,
})


