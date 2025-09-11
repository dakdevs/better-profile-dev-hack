'use client'

import { useChat } from '@ai-sdk/react'
import { eventIteratorToStream } from '@orpc/client'
import { useMutation } from '@tanstack/react-query'

import { orpcClient } from '~/orpc/client'

import ChatContent from './chat-content'
import ChatInput from './chat-input'

export default function ChatContainer() {
	const { mutateAsync: sendChatMessage } = useMutation(
		orpcClient.interview.sendMessage.mutationOptions(),
	)

	const {
		messages: _messages,
		sendMessage: _sendMessage,
		status: _status,
	} = useChat({
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
			reconnectToStream(_options) {
				throw new Error('Not implemented')
			},
		},
	})

	return (
		<div className="flex h-full w-full flex-col">
			<ChatContent />
			<ChatInput />
		</div>
	)
}
