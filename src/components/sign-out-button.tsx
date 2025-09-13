'use client'

import { Button } from '@mantine/core'
import { LogOut } from 'lucide-react'

import { signOut } from '~/lib/auth-client'

export default function SignOutButton() {
	return (
		<Button
			rightSection={<LogOut size={16} />}
			variant="filled"
			color="rgba(138, 30, 30, 1)"
			radius="md"
			onClick={() => {
				void signOut()
			}}
		>
			{'Sign Out'}
		</Button>
	)
}
