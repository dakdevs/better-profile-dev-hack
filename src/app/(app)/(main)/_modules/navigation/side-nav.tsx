import NavigationContainer from './navigation-container'
import NavigationHeader from './navigation-header'
import NavigationItem from './navigation-item'
import navigationItems from './navigation-items'

export default function SideNav() {
	return (
		<NavigationContainer>
			<div className="p-sm space-y-md h-full w-full border-r border-neutral-200">
				<div className="px-sm py-md flex items-center justify-between">
					<NavigationHeader />
				</div>
				<Navigation />
			</div>
		</NavigationContainer>
	)
}

function Navigation() {
	return (
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
	)
}
