import { ReactNode } from 'react'

import SideNav from './_modules/navigation/side-nav'

export default function MainLayout({ children }: { children: ReactNode }) {
	return (
		<div className="flex">
			<SideNav />
			<main className="h-full flex-1">{children}</main>
		</div>
	)
}
