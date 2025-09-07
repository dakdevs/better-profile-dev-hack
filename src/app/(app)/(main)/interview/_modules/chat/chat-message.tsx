import { UIMessage } from 'ai'
import { Streamdown } from 'streamdown'

import { cn } from '~/utils/cn'

import ChatAvatar from './chat-avatar'

export default function ChatMessage({ message }: { message: UIMessage }) {
	const isUser = message.role === 'user'

	return (
		<div className={cn('gap-sm flex flex-col', isUser ? 'flex-row-reverse' : null)}>
			{isUser ? <ChatAvatar /> : null}
			<div
				className={cn(
					isUser ? 'ml-lg' : 'mr-3xl',
					isUser ? 'bg-better-indigo-800 px-md py-sm w-fit rounded-xl text-white' : null,
				)}
			>
				{message.parts.map((part, index) =>
					part.type === 'text' ? <Streamdown key={`part-${index}`}>{part.text}</Streamdown> : null,
				)}
			</div>
		</div>
	)
}
