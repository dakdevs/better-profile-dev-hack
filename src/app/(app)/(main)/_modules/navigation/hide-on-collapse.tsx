'use client'

import type { ReactNode } from 'react'

import { useExpandNavigation } from '~/atoms/navigation-atom'
import { cn } from '~/utils/cn'

export default function HideOnCollapse({ children }: { children: ReactNode }) {
	const [expandNavigation] = useExpandNavigation()

	return (
		<span
			className={cn(
				'whitespace-nowrap transition-opacity duration-200',
				expandNavigation ? 'opacity-100' : 'md:opacity-0',
			)}
		>
			{children}
		</span>
	)
}
