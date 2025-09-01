import type { ReactNode } from 'react'
import Image from 'next/image'

import { cn } from '~/utils/cn'

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
		<div className="space-y-md">
			<div className="py-md px-sm md:px-lg border-b border-neutral-200">
				<h1 className="font-rakkas text-xl md:text-3xl">{title}</h1>
				<p className="text-sm text-neutral-500">{description}</p>
			</div>
			{bannerImage ? (
				<div className="px-md">
					<div className="relative h-48 w-full">
						<Image
							src={bannerImage}
							alt="banner"
							fill
							className={cn('object- rounded-lg object-cover', bannerImageClassName)}
						/>
					</div>
				</div>
			) : null}
			<div className="px-lg py-md">{children}</div>
		</div>
	)
}
