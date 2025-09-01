import NavLink from '~/components/nav-link'

import GoogleLogin from './_modules/google-login'

export default function LoginPage() {
	return (
		<div className="flex size-full items-center justify-center">
			<div className="gap-lg flex w-full max-w-[28rem] flex-col items-center justify-center">
				<div className="gap-sm flex flex-col items-center justify-center">
					<div className="text-better-indigo font-rakkas flex items-center text-2xl sm:text-3xl">
						Better Profile
					</div>
					<h1 className="w-full text-center text-2xl font-light">Welcome back</h1>
				</div>
				<GoogleLogin />
				<div className="w-full text-center text-xs text-neutral-800">
					By continuing, you agree to Better Profile's{' '}
					<NavLink href="/terms">Terms of Service</NavLink> and{' '}
					<NavLink href="/privacy">Privacy Policy</NavLink>
				</div>
			</div>
		</div>
	)
}
