import { db } from '~/db'
import { getRequiredSession } from '~/lib/auth'

import Conversation from './_modules/chat/v2/chat/conversation'

<<<<<<< HEAD
export default function InterviewPage() {
=======
export default async function InterviewPage() {
	const session = await getRequiredSession()
	const initialMessages = await getInitialMessages(session.user.id)

>>>>>>> production
	return (
		<div className="flex h-full flex-col overflow-hidden">
			<Conversation
				userId={session.user.id}
				initialMessages={initialMessages}
			/>
		</div>
	)
}

async function getInitialMessages(userId: string) {
	const messages = await db.query.interviewMessages.findMany({
		where: (interviewMessages, { eq }) => eq(interviewMessages.userId, userId),
		orderBy: (interviewMessages, { asc }) => asc(interviewMessages.createdAt),
		columns: {
			content: true,
		},
	})

	return messages.map(({ content }) => content)
}
