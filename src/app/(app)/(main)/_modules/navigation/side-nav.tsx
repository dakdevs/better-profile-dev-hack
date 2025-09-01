import { ChevronsLeft } from 'lucide-react'

import NavigationItem from './navigation-item'
import navigationItems from './navigation-items'

export default function SideNav() {
	return (
		<div className="p-sm space-y-md w-72 bg-white">
			<div className="px-sm py-md flex items-center justify-between">
				<h1 className="font-rakkas text-better-indigo text-3xl">Better Profile</h1>
				<button className="p-sm aspect-square cursor-pointer rounded-md text-sm text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900">
					<ChevronsLeft size={24} />
				</button>
			</div>
			<ul className="space-y-xs">
				{navigationItems.map((item) => {
					return (
						<li key={item.label}>
							<NavigationItem
								href={item.href}
								navIcon={<item.icon size={18} />}
								label={item.label}
							/>
						</li>
					)
				})}
			</ul>
		</div>
	)
}
