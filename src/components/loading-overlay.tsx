'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useTimeout } from 'usehooks-ts'

import { cn } from '~/utils/cn'

export default function LoadingOverlay() {
	const [show, setShow] = useState(true)
	useTimeout(() => {
		setShow(false)
	}, 400)

	return (
		<div
			className={cn(
				'fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-300',
				show ? 'pointer-events-none opacity-100' : 'pointer-events-auto opacity-0',
			)}
		>
			<Loader2
				size={40}
				className="text-better-indigo animate-spin"
			/>
		</div>
	)
}
