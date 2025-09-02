'use client'

import type { ReactNode } from 'react'

import { useExpandNavigation, useNavigationState } from '~/atoms/navigation-atom'
import { cn } from '~/utils/cn'

export default function NavigationContainer({ children }: { children: ReactNode }) {
	const [navigationState] = useNavigationState()
	const [expandNavigation] = useExpandNavigation()

	return (
		<div
			className={cn(
				'transition-all duration-200 ease-in-out',
				expandNavigation ? 'md:w-72' : 'md:w-[70px]',
			)}
		>
			<div
				className={cn(
					'overflow-none fixed inset-0 z-10 h-full bg-white transition-all duration-300 ease-in-out md:static md:z-0 md:bg-neutral-50/50 md:transition-none',
					navigationState
						? 'translate-x-0 opacity-100'
						: '-translate-x-full opacity-0 md:translate-x-0 md:opacity-100',
				)}
			>
				{children}
			</div>
		</div>
	)
}
