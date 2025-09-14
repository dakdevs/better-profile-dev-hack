'use client'

import { useChat } from '@ai-sdk/react'
import { eventIteratorToStream } from '@orpc/client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

import { orpcClient } from '~/orpc/client'

import ConversationInput from './conversation-input'
import ConversationThread from './conversation-thread'

export default function ConversationContainer() {
	const { mutateAsync: sendChatMessage, isPending } = useMutation(
		orpcClient.interview.sendMessage.mutationOptions(),
	)

	const { data: initialMessagesData, isFetching } = useQuery(
		orpcClient.interview.getMessages.queryOptions(),
	)

	const originalMessages = initialMessagesData?.messages.map((message) => message.content) ?? []

	const { messages, sendMessage, status } = useChat({
		transport: {
			async sendMessages({ chatId, messages }) {
				return eventIteratorToStream(
					await sendChatMessage({
						chatId: chatId,
						message: messages[0],
					}),
				)
			},
			reconnectToStream(options) {
				console.log('reconnectToStream', options)

				throw new Error('Not implemented')
			},
		},
	})

	const isLoading = (status !== 'ready' && status !== 'error') || isPending

	return (
		<div className="flex h-full w-full flex-col overflow-hidden">
			{/* Scrollable viewport for messages */}
			<div className="relative min-h-0 flex-1 overflow-y-auto">
				{isFetching ? (
					<div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
						<Loader2 className="animate-spin" />
					</div>
				) : null}
				<ConversationThread messages={messages.length > 0 ? messages : originalMessages} />
			</div>

			{/* Fixed input at bottom */}
			<div className="shrink-0 border-t bg-white p-4">
				<ConversationInput
					isLoading={isLoading}
					onSubmit={(message) => {
						void sendMessage({
							text: message,
						})
					}}
				/>
			</div>
		</div>
	)
}
