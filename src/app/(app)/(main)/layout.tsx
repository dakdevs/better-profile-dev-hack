import { ReactNode } from 'react'

import MobileHeader from './_modules/navigation/mobile-header-container'
import SideNav from './_modules/navigation/side-nav'

export default function MainLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex h-full flex-col md:flex-row">
			<SideNav />
			<MobileHeader />
			<main className="flex h-full flex-1 flex-col">{children}</main>
		</div>
	)
}
