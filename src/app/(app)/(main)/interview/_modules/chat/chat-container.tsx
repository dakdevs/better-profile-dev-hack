'use client'

import { useChat } from '@ai-sdk/react'
import { eventIteratorToStream } from '@orpc/client'
import { useMutation } from '@tanstack/react-query'

import { orpcClient } from '~/orpc/client'

import ChatContent from './chat-content'
import ChatInput from './chat-input'

export default function ChatContainer() {
	const { mutateAsync: sendChatMessage, isPending } = useMutation(
		orpcClient.interview.sendMessage.mutationOptions(),
	)

	const { messages, sendMessage, status } = useChat({
		resume: true,
		transport: {
			async sendMessages(options) {
				return eventIteratorToStream(
					await sendChatMessage({
						chatId: options.chatId,
						message: options.messages[0],
					}),
				)
			},
			reconnectToStream(options) {
				throw new Error('Not implemented')
			},
		},
	})

	const isLoading = (status !== 'ready' && status !== 'error') || isPending

	return (
		<div className="flex flex-1 flex-col">
			<div className="flex-1 overflow-y-auto">
				<ChatContent messages={messages} />
			</div>
			<ChatInput
				isLoading={isLoading}
				onSubmit={(message) => {
					void sendMessage({
						text: message,
					})
				}}
			/>
		</div>
	)
}
