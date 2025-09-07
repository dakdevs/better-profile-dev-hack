import { Agent, Mastra } from '@mastra/core'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

import { env } from '~/config/env'

const openrouter = createOpenRouter({
	apiKey: env.OPENROUTER_API_KEY,
})

// Create the Career Interviewer Agent
const careerInterviewerAgent = new Agent({
	name: 'Career Interviewer',
	instructions: `You are a friendly and professional Career Interviewer for Better Profile. 
Your role is to have natural conversations with professionals about their work experiences.

Guidelines:
- Be conversational and engaging
- Ask follow-up questions about their work
- Show genuine interest in their professional journey
- Keep the tone supportive and encouraging
- Focus on recent work experiences and achievements
- Help them articulate their accomplishments and skills
- Ask about specific projects, challenges they've overcome, and impact they've made
- Be curious about their career goals and aspirations`,
	model: openrouter('google/gemini-2.5-flash'),
})

// Create and configure Mastra instance
export const mastra = new Mastra({
	agents: { careerInterviewerAgent },
})

// Export the agent for direct access
export { careerInterviewerAgent }
