import type { ReactNode } from 'react'
import Image from 'next/image'

import { cn } from '~/utils/cn'

import SidebarToggle from './sidebar-toggle'

export default function PageContainer({
	title,
	description,
	children,
	bannerImage,
	bannerImageClassName,
}: {
	title: string
	description: string
	children: ReactNode
	bannerImage?: string
	bannerImageClassName?: string
}) {
	return (
		<div className={cn('flex h-full flex-col md:h-dvh', bannerImage && 'space-y-md md:space-y-lg')}>
			<div className="gap-md p-md flex items-center border-b border-neutral-200">
				<SidebarToggle displayOn="collapsed" />
				<div>
					<h1 className="font-rakkas text-xl md:text-3xl">{title}</h1>
					<p className="text-sm text-neutral-500">{description}</p>
				</div>
			</div>
			{bannerImage ? (
				<div className="px-md md:px-lg">
					<div className="relative h-48 w-full">
						<Image
							src={bannerImage}
							alt="banner"
							fill
							className={cn('rounded-lg object-cover', bannerImageClassName)}
						/>
					</div>
				</div>
			) : null}
			<div className="flex-1 overflow-y-auto">{children}</div>
		</div>
	)
}
