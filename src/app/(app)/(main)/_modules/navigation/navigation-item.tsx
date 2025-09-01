'use client'

import type { ComponentProps, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useExpandNavigation } from '~/atoms/navigation-atom'
import { cn } from '~/utils/cn'

import HideOnCollapse from './hide-on-collapse'

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
	const [expandNavigation] = useExpandNavigation()

	const pathname = usePathname()
	const isActive = isActiveForHref(pathname, linkProps.href, allowActivePrefix)

	return (
		<Link
			{...linkProps}
			className={cn(
				'gap-md py-sm px-md group flex h-11 items-center rounded-md text-lg font-medium transition-colors duration-300',
				isActive ? 'bg-neutral-100' : 'bg-transparent',
				className,
			)}
		>
			<span
				className={cn(
					'w-fit transition-colors duration-150',
					isActive ? 'text-neutral-900' : 'text-neutral-500 group-hover:text-neutral-900',
					!expandNavigation && 'flex items-center justify-center',
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
				<HideOnCollapse>{label}</HideOnCollapse>
			</span>
		</Link>
	)
}

function isActiveForHref(
	currentPathname: string,
	href: ComponentProps<typeof Link>['href'],
	allowPrefix: boolean,
) {
	const parsedHref = typeof href === 'string' ? href : href.href

	if (!parsedHref) {
		return false
	}

	if (currentPathname === parsedHref) {
		return true
	}

	if (allowPrefix && currentPathname.startsWith(parsedHref)) {
		return true
	}

	return false
}
