import type { UIMessage } from 'ai'

export default function ChatContent({ messages }: { messages: UIMessage[] }) {
	return (
		<div className="flex flex-1 flex-col-reverse overflow-y-auto">
			{messages.map((message) => {
				return (
					<div>
						{message.parts.map((part) => {
							return part.type === 'text' ? part.text : null
						})}
					</div>
				)
			})}
		</div>
	)
}
