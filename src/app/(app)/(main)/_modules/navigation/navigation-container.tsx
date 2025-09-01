'use client'

import type { ReactNode } from 'react'

import { cn } from '~/utils/cn'

import useNavigationState from './navigation-atom'

export default function NavigationContainer({ children }: { children: ReactNode }) {
	const [navigationState] = useNavigationState()

	return (
		<div
			className={cn(
				'overflow-none fixed top-0 right-0 bottom-0 left-0 z-10 h-full bg-white transition-transform duration-300 md:static md:z-0 md:w-72 md:bg-neutral-50/50 md:transition-none',
				navigationState
					? 'translate-x-0 opacity-100'
					: '-translate-x-full opacity-0 md:translate-x-0 md:opacity-100',
			)}
		>
			{children}
		</div>
	)
}
