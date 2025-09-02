'use client'

import Link from 'next/link'
import { X } from 'lucide-react'

import { useExpandNavigation, useNavigationState } from '~/atoms/navigation-atom'
import SidebarToggle from '~/components/sidebar-toggle'
import { TextMorph } from '~/components/text-morph'
import { cn } from '~/utils/cn'

export default function NavigationHeader() {
	const [navigationState, setNavigationState] = useNavigationState()
	const [expandNavigation, setExpandNavigation] = useExpandNavigation()

	const title = expandNavigation ? 'Better Profile' : 'BP'

	return (
		<>
			<Link
				href="/"
				className="cursor-pointer"
			>
				<h1 className="font-rakkas text-better-indigo text-3xl">
					<TextMorph
						transition={{ ease: 'easeInOut', duration: 0.2 }}
						className="whitespace-nowrap"
					>
						{title}
					</TextMorph>
				</h1>
			</Link>
			<button
				disabled={!navigationState}
				onClick={() => {
					setNavigationState(false)
				}}
				className="p-sm aspect-square cursor-pointer rounded-md text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 md:hidden"
			>
				<X size={24} />
			</button>
			<SidebarToggle displayOn="expanded" />
		</>
	)
}
