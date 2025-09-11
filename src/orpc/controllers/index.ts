//src/orpc/controllers/index.ts
import interview from './interview'
import ping from './ping'
import recruiter from './recruiter'

const controllers = {
	ping,
	interview,
	recruiter,
} as const

export default controllers
