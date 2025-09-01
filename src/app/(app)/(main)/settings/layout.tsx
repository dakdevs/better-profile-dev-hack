import type { ReactNode } from 'react'

import PageContainer from '~/components/page-container'

export default function MatchesLayout({ children }: { children: ReactNode }) {
	return (
		<PageContainer
			title="Settings"
			description="Manage your account settings"
			bannerImage="/images/settings-banner.png"
			bannerImageClassName="object-bottom"
			bannerPostion="right"
		>
			{children}
		</PageContainer>
	)
}
