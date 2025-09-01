import type { ComponentProps } from 'react'
import Link from 'next/link'

import { cn } from '~/utils/cn'

export default function NavLink({ className, children, ...props }: ComponentProps<typeof Link>) {
	return (
		<Link
			{...props}
			className={cn('underline underline-offset-2', className)}
		>
			{children}
		</Link>
	)
}
