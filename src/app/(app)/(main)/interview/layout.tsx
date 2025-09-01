import type { ReactNode } from 'react'

import PageContainer from '~/components/page-container'

export default function InterviewLayout({ children }: { children: ReactNode }) {
	return (
		<PageContainer
			title="Interview"
			description="Conduct interviews to create a living, verifiable profile"
			bannerImage="/images/interview-banner.png"
			bannerImageClassName="object-top"
		>
			{children}
		</PageContainer>
	)
}
