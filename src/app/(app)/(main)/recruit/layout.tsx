import type { ReactNode } from 'react'

import PageContainer from '~/components/page-container'

import '@calcom/atoms/globals.min.css'

export default function RecruitLayout({ children }: { children: ReactNode }) {
	return (
		<PageContainer
			title="Recruit"
			description="Recruit with Better Profile"
			bannerImage="/images/matches-banner-v2.png"
			bannerImageClassName="object-top-right"
		>
			{children}
		</PageContainer>
	)
}
