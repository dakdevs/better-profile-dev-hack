import type { UIMessage } from 'ai'

import ChatMessage from './chat-message'

export default function ChatContent({ messages }: { messages: UIMessage[] }) {
	return (
		<div className="p-lg gap-md mx-auto flex max-w-5xl flex-1 flex-col-reverse">
			{messages.toReversed().map((message) => {
				return (
					<ChatMessage
						key={message.id}
						message={message}
					/>
				)
			})}
		</div>
	)
}
