'use client'

import { ComponentPropsWithRef } from 'react'
import { Slottable } from '@radix-ui/react-slot'

import { Button } from '~/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { cn } from '~/lib/utils'

type TooltipIconButtonProps = {
	tooltip: string
	side?: 'top' | 'bottom' | 'left' | 'right'
}

export function TooltipIconButton({
	children,
	tooltip,
	side = 'bottom',
	className,
	ref,
	...rest
}: TooltipIconButtonProps & ComponentPropsWithRef<typeof Button>) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					{...rest}
					className={cn('aui-button-icon size-6 p-1', className)}
					ref={ref}
				>
					<Slottable>{children}</Slottable>
					<span className="aui-sr-only sr-only">{tooltip}</span>
				</Button>
			</TooltipTrigger>
			<TooltipContent side={side}>{tooltip}</TooltipContent>
		</Tooltip>
	)
}

TooltipIconButton.displayName = 'TooltipIconButton'
