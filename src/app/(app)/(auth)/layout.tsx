import type { ReactNode } from 'react'

import { DualSplitView } from '~/components/dual-split-view'

export default function LoginLayout({
	children,
	image,
}: {
	children: ReactNode
	image: ReactNode
}) {
	return (
		<DualSplitView
			right={<div className="p-md size-full">{image}</div>}
			left={<div className="p-md size-full">{children}</div>}
		/>
	)
}
