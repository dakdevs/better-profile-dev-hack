'use client'

import type { ComponentProps, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '~/utils/cn'

export default function NavigationItem({
	navIcon,
	label,
	className,
	allowActivePrefix = false,
	...linkProps
}: {
	label: string
	navIcon: ReactNode
	allowActivePrefix?: boolean
} & ComponentProps<typeof Link>) {
	const pathname = usePathname()

	const isActive = allowActivePrefix
		? pathname.startsWith(String(linkProps.href))
		: pathname === linkProps.href

	return (
		<Link
			{...linkProps}
			className={cn(
				'gap-md py-sm px-md group flex items-center rounded-md text-lg font-medium transition-colors duration-300',
				isActive ? 'bg-neutral-100' : 'bg-transparent',
				className,
			)}
		>
			<span
				className={cn(
					'transition-colors duration-150',
					isActive ? 'text-neutral-900' : 'text-neutral-500 group-hover:text-neutral-900',
				)}
			>
				{navIcon}
			</span>
			<span
				className={cn(
					'transition-colors duration-150',
					isActive ? 'text-neutral-900' : 'text-neutral-500 group-hover:text-neutral-900',
				)}
			>
				{label}
			</span>
		</Link>
	)
}
