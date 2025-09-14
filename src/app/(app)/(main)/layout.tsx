import { ReactNode } from 'react'

import MobileHeader from './_modules/navigation/mobile-header-container'
import SideNav from './_modules/navigation/side-nav'

export default function MainLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex h-dvh flex-col md:flex-row">
			<SideNav />
			<MobileHeader />
			<main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
		</div>
	)
}
