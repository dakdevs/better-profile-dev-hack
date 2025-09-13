import { memo } from 'react'
import { Avatar } from '@mantine/core'
import { UIMessage } from 'ai'
import { randomInteger } from 'remeda'
import { Streamdown } from 'streamdown'

import { TextShimmer } from '~/components/motion-primitives/text-shimmer'
import { cn } from '~/utils/cn'

import ConversationAvatar from './conversation-avatar'

export const INTERVIEWER_STATUS_LABELS = [
	'Listening',
	'Processing',
	'Reflecting',
	'Formulating',
	'Considering',
	'Reviewing',
	'Synthesizing',
	'Exploring',
	'Probing',
	'Digging Deeper',
	'Clarifying',
	'Unpacking',
	'Examining',
	'Assessing',
	'Connecting Dots',
	'Gathering Context',
	'Surfacing Details',
	'Checking Assumptions',
	'Framing',
	'Calibrating',
	'Composing Question',
	'Refining Question',
	'Following Up',
	'Prioritizing',
	'Scoping',
	'Summarizing',
	'Choosing Next Topic',
	'Pivoting',
	'Noting',
	'Pausing',
] as const

export default memo(function ConversationMessage({ message }: { message: UIMessage }) {
	const isUser = message.role === 'user'

	return (
		<div
			className={cn(
				'gap-sm flex flex-col',
				isUser ? 'flex-row-reverse' : 'gap-md flex-row items-center',
			)}
		>
			<div className="order-1">
				{isUser ? <ConversationAvatar /> : <Avatar className="font-rakkas font-bold">BP</Avatar>}
			</div>
			<div
				className={cn(
					'order-2',
					isUser ? 'md:ml-lg' : 'md:mr-3xl my-lg',
					isUser ? 'bg-better-indigo-800 px-md py-sm w-fit rounded-xl text-white' : null,
				)}
			>
				{message.parts.map((part, index) => {
					if (part.type === 'text') {
						if (isUser) {
							return part.text
						}

						return (
							<Streamdown
								key={`part-${index}`}
								components={{
									p: ({ children }) => <p>{children}</p>,
								}}
							>
								{part.text}
							</Streamdown>
						)
					} else if (
						part.type === 'reasoning'
						&& message.parts.every((part) => part.type !== 'text')
					) {
						return (
							<TextShimmer key={`part-${index}`}>
								{`${INTERVIEWER_STATUS_LABELS[randomInteger(0, INTERVIEWER_STATUS_LABELS.length - 1)]}...`}
							</TextShimmer>
						)
					}

					return null
				})}
			</div>
		</div>
	)
})
