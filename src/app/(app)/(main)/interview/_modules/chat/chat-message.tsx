import { UIMessage } from 'ai'

export default function ChatMessage({ message }: { message: UIMessage }) {
	return <div>{message.parts.map((part) => (part.type === 'text' ? part.text : null))}</div>
}
