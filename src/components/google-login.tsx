'use client'

import { signInWithGoogle } from '~/lib/auth-client'
import Google from '~/svgs/google'

export default function GoogleLogin({ label }: { label: string }) {
	return (
		<button
			onClick={() => {
				void signInWithGoogle()
			}}
			className="py-sm hover: flex w-full cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-transparent transition-colors hover:border-neutral-400 hover:bg-neutral-100"
		>
			<div className="gap-sm flex items-center">
				<Google className="size-5" />
				<span className="font-semibold">{label}</span>
			</div>
		</button>
	)
}
