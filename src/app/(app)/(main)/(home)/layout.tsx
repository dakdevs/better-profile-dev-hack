import type { ReactNode } from 'react'

import PageContainer from '~/components/page-container'

export default function HomeLayout({ children }: { children: ReactNode }) {
	return (
		<PageContainer
			title="Dashboard"
			description="Breakdown of your account"
			bannerImage="/images/settings-banner-v2.png"
			bannerImageClassName="object-bottom"
		>
			{children}
		</PageContainer>
	)
}
