'use client'

import { Input } from '@base-ui-components/react'

export default function ChatInput() {
	return (
		<div className="w-full">
			<Input
				placeholder="Type your reply..."
				className="p-md flex h-24 w-full items-start rounded-xl ring ring-neutral-300"
			/>
		</div>
	)
}
