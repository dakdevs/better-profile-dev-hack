// ~/src/ai/mastra/index.ts

import { Mastra } from '@mastra/core'

import { careerInterviewerAgent } from './agents/career-interviewer-agent'

export const mastra = new Mastra({
	agents: { careerInterviewerAgent },
})
