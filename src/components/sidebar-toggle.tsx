'use client'

import { ChevronsLeft, X } from 'lucide-react'

import { useExpandNavigation } from '~/atoms/navigation-atom'
import { cn } from '~/utils/cn'

export default function SidebarToggle({ displayOn }: { displayOn: 'expanded' | 'collapsed' }) {
	const [expandNavigation, setExpandNavigation] = useExpandNavigation()

	const shouldShow = displayOn === 'expanded' ? expandNavigation : !expandNavigation

	return (
		<div
			className={cn(
				'hidden overflow-hidden transition-all duration-200 ease-in-out md:block',
				shouldShow ? 'max-w-10' : 'max-w-0',
			)}
		>
			<button
				onClick={() => {
					setExpandNavigation(!expandNavigation)
				}}
				className="p-sm hidden aspect-square cursor-pointer rounded-md text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 md:flex md:items-center md:justify-center"
			>
				<ChevronsLeft
					size={24}
					className={cn(displayOn !== 'expanded' && 'rotate-180')}
				/>
			</button>
		</div>
	)
}
