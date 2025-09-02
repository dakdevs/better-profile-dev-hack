import { redirect } from 'next/navigation'

import GoogleLogin from '~/components/google-login'
import NavLink from '~/components/nav-link'
import { getSession } from '~/lib/auth'

export default async function LoginPage() {
	const auth = await getSession()

	if (auth) {
		return redirect('/')
	}

	return (
		<div className="flex size-full items-center justify-center">
			<div className="gap-lg flex w-full max-w-[28rem] flex-col items-center justify-center">
				<div className="gap-sm flex flex-col items-center justify-center">
					<div className="text-better-indigo font-rakkas flex items-center text-4xl">
						{'Better Profile'}
					</div>
					<h1 className="w-full text-center text-2xl font-light">{'Begin your journey'}</h1>
				</div>
				<GoogleLogin label="Sign up with Google" />
				<div className="w-full text-center text-sm text-neutral-800">
					{'Already have an account? '}
					<NavLink href="/login">{'Log in'}</NavLink>
				</div>
				<div className="w-full text-center text-xs text-neutral-800">
					{"By continuing, you agree to Better Profile's"}{' '}
					<NavLink href="/terms">{'Terms of Service'}</NavLink>
					{' and'} <NavLink href="/privacy">{'Privacy Policy'}</NavLink>
				</div>
			</div>
		</div>
	)
}
