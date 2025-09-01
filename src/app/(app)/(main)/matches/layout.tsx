import type { ReactNode } from 'react'

import PageContainer from '~/components/page-container'

export default function MatchesLayout({ children }: { children: ReactNode }) {
	return (
		<PageContainer
			title="Matched Roles"
			description="View the roles you will succeed in"
			bannerImage="/images/matches-banner-v2.png"
			bannerImageClassName="object-top-right"
		>
			{children}
		</PageContainer>
	)
}
