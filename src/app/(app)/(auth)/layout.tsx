import type { ReactNode } from 'react'
import Image from 'next/image'

import { DualSplitView } from '~/components/dual-split-view'

export default function LoginLayout({ children }: { children: ReactNode }) {
	return (
		<DualSplitView
			right={
				<div className="p-md size-full">
					<div className="relative size-full overflow-hidden rounded-xl">
						<Image
							alt="test"
							src="/images/bg-2.png"
							fill
							className="object-cover object-top"
						/>
					</div>
				</div>
			}
			left={<div className="p-md size-full">{children}</div>}
		/>
	)
}
