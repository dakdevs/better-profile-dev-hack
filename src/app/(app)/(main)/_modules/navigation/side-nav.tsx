import type { LucideIcon } from 'lucide-react'

import AccountState from './account-state'
import NavigationContainer from './navigation-container'
import NavigationHeader from './navigation-header'
import NavigationItem from './navigation-item'
import { accountNavigationItems, mainNavigationItems } from './navigation-items'

export default function SideNav() {
	return (
		<NavigationContainer>
			<div className="p-sm space-y-md flex size-full flex-col border-r border-neutral-200">
				<div className="px-sm py-md flex items-center justify-between">
					<NavigationHeader />
				</div>
				<div className="flex flex-1 flex-col justify-between">
					<Navigation items={mainNavigationItems} />
					<div className="space-y-md">
						<Navigation items={accountNavigationItems} />
						<AccountState />
					</div>
				</div>
			</div>
		</NavigationContainer>
	)
}

function Navigation({ items }: { items: { label: string; href: string; icon: LucideIcon }[] }) {
	return (
		<ul className="space-y-xs">
			{items.map(({ label, href, icon: NavIcon }) => {
				return (
					<li key={label}>
						<NavigationItem
							href={href}
							navIcon={<NavIcon size={18} />}
							label={label}
						/>
					</li>
				)
			})}
		</ul>
	)
}
