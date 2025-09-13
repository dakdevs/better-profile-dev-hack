import { Mastra } from '@mastra/core'

import { careerInterviewerAgent } from './agents/career-interviewer-agent'
import { topicExtractionAgent } from './agents/topic-extraction-agent'
import { skillExtractionAgent } from './agents/skill-extraction-agent'

export const mastra = new Mastra({
	agents: { 
		careerInterviewerAgent,
		topicExtractionAgent,
		skillExtractionAgent,
	},
})
