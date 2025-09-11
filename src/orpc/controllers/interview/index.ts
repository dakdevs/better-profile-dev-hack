import getMessage from './get-message'
import sendMessage from './send-message'

const interviewControllers = {
	getMessage,
	sendMessage,
} as const

export default interviewControllers
