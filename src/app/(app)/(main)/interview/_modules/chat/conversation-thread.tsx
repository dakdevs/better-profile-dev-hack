import { useEffect, useRef } from 'react'
import type { UIMessage } from 'ai'

import ConversationMessage from './conversation-message'

export default function ConversationThread({ messages }: { messages: UIMessage[] }) {
	const endOfMessagesRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		// Scroll to bottom whenever messages change
		endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	return (
		<>
			<div className="mx-auto w-full max-w-5xl px-4">
				<div className="flex flex-col gap-4 py-4">
					{messages.map((message) => {
						return (
							<ConversationMessage
								key={message.id}
								message={message}
							/>
						)
					})}
				</div>
			</div>
			{/* Invisible element to scroll to */}
			<div ref={endOfMessagesRef} />
		</>
	)
}
