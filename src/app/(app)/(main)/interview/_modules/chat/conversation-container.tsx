'use client'

import { useChat } from '@ai-sdk/react'
import { eventIteratorToStream } from '@orpc/client'
import { useMutation, useQuery } from '@tanstack/react-query'

import { orpcClient } from '~/orpc/client'

import ConversationInput from './conversation-input'
import ConversationThread from './conversation-thread'

export default function ConversationContainer() {
	const { data, isLoading: getMessagesIsLoading } = useQuery(
		orpcClient.interview.getMessages.queryOptions(),
	)

	const { mutateAsync: sendChatMessage, isPending } = useMutation(
		orpcClient.interview.sendMessage.mutationOptions(),
	)

	const { messages, sendMessage, status } = useChat({
		messages
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

	const isLoading = (status !== 'ready' && status !== 'error') || isPending || getMessagesIsLoading

	return (
		<div className="flex max-h-full flex-1 flex-col">
			<div className="max-h-full flex-1 overflow-y-auto">
				<ConversationThread messages={messages} />
			</div>
			<ConversationInput
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
