'use client'

import { ChevronsLeft, X } from 'lucide-react'

import useNavigationState from './navigation-atom'

export default function NavigationHeader() {
	const [navigationState, setNavigationState] = useNavigationState()

	return (
		<>
			<h1 className="font-rakkas text-better-indigo text-3xl">{'Better Profile'}</h1>
			<button className="p-sm hidden aspect-square cursor-pointer rounded-md text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 md:block">
				<ChevronsLeft size={24} />
			</button>
			<button
				disabled={!navigationState}
				onClick={() => {
					setNavigationState(false)
				}}
				className="p-sm aspect-square cursor-pointer rounded-md text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 md:hidden"
			>
				<X size={24} />
			</button>
		</>
	)
}
