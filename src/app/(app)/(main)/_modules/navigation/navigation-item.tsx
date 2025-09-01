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

	const isActive = isActiveForHref(pathname, linkProps.href, allowActivePrefix)

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

type LinkHref = ComponentProps<typeof Link>['href']

function normalizePath(input: unknown): string {
	if (input == null) return '/'
	const str = String(input).split('#')[0].split('?')[0]
	const withLeading = str.startsWith('/') ? str : `/${str}`
	if (withLeading.length > 1 && withLeading.endsWith('/')) return withLeading.slice(0, -1)
	return withLeading || '/'
}

function hrefToPathname(href: LinkHref): string {
	if (typeof href === 'string') return normalizePath(href)
	if (href instanceof URL) return normalizePath(href.pathname)
	if (typeof href === 'object' && href !== null && 'pathname' in href) {
		const pathname = (href as { pathname?: unknown }).pathname
		return normalizePath(typeof pathname === 'string' ? pathname : '')
	}
	return normalizePath(String(href))
}

function isActiveForHref(currentPathname: string, href: LinkHref, allowPrefix: boolean): boolean {
	const current = normalizePath(currentPathname)
	const target = hrefToPathname(href)

	if (!allowPrefix) return current === target

	if (target === '/') return current === '/'
	if (current === target) return true
	return current.startsWith(`${target}/`)
}
