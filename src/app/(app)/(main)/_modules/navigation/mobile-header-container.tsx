'use client'

import { Menu } from 'lucide-react'

import useNavigationState from './navigation-atom'

export default function MobileHeader() {
	const [navigationState, setNavigationState] = useNavigationState()

	return (
		<div className="p-sm gap-sm flex items-center border-b border-neutral-200 md:hidden">
			<button
				onClick={() => {
					setNavigationState(!navigationState)
				}}
				className="p-sm aspect-square cursor-pointer rounded-md text-sm text-neutral-900 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:bg-neutral-100"
			>
				<Menu
					size={24}
					className="md:hidden"
				/>
			</button>
			<h1 className="font-rakkas text-better-indigo text-3xl">{'Better Profile'}</h1>
		</div>
	)
}
