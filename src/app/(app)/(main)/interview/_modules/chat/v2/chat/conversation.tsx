'use client'

import { AssistantRuntimeProvider } from '@assistant-ui/react'
import { AssistantChatTransport, useChatRuntime } from '@assistant-ui/react-ai-sdk'
import { UIMessage } from 'ai'

import { Thread } from '~/components/assistant-ui/thread'

export default function Conversation({
	userId,
	initialMessages,
}: {
	userId: string
	initialMessages: UIMessage[]
}) {
	console.log('initialMessages', initialMessages)

	const runtime = useChatRuntime({
		messages: initialMessages,
		transport: new AssistantChatTransport({
			api: '/api/interview',
			prepareSendMessagesRequest({ messages, id }) {
				return {
					body: {
						message: messages[messages.length - 1],
						id,
					},
				}
			},
		}),
		id: userId,
	})

	return (
		<AssistantRuntimeProvider runtime={runtime}>
			<div className="size-full">
				<Thread />
			</div>
		</AssistantRuntimeProvider>
	)
}
