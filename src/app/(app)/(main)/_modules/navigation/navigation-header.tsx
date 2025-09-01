'use client'

import { ChevronsLeft, X } from 'lucide-react'

import useNavigationState from './navigation-atom'

export default function NavigationHeader() {
	const [navigationState, setNavigationState] = useNavigationState()

	return (
		<>
			<h1 className="font-rakkas text-better-indigo text-3xl">Better Profile</h1>
			<button className="p-sm aspect-square cursor-pointer rounded-md text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900">
				<ChevronsLeft
					size={24}
					className="hidden md:block"
				/>
				<X
					size={24}
					className="block md:hidden"
				/>
			</button>
		</>
	)
}
