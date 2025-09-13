import type { UIMessage } from 'ai'

import ConversationMessage from './conversation-message'

export default function ConversationThread({ messages }: { messages: UIMessage[] }) {
	return (
		<div className="p-lg gap-md mx-auto flex max-w-5xl flex-1 flex-col-reverse">
			{messages.toReversed().map((message) => {
				return (
					<ConversationMessage
						key={message.id}
						message={message}
					/>
				)
			})}
		</div>
	)
}
