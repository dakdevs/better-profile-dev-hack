// src/orpc/controllers/recruiter/index.ts
import { jobs } from './jobs'
import { matching } from './matching'

const recruiterControllers = {
	jobs,
	matching,
} as const

export default recruiterControllers
