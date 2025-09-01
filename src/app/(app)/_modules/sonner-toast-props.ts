import type { ComponentProps } from 'react'
import type { Toaster } from 'sonner'

export const sonnerToastProps = {
	toastOptions: {
		classNames: {
			content: 'font-sans-alt text-lg',
		},
	},
} satisfies ComponentProps<typeof Toaster>
