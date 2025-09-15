import { AuthForm } from '~/app/_modules/auth-form'

export default function AuthDebugPage() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-slate-900 dark:to-slate-800">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">Auth Debug</h1>
					<p className="text-slate-600 dark:text-slate-300">Testing Google OAuth integration</p>
				</div>

				<AuthForm redirectTo="/dashboard" />

				<div className="mt-8 rounded-lg bg-white p-4 shadow dark:bg-slate-800">
					<h3 className="mb-2 font-semibold">Debug Info:</h3>
					<div className="space-y-1 text-sm">
						<p>
							<strong>Auth URL:</strong>{' '}
							{process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000'}
						</p>
						<p>
							<strong>Expected Callback:</strong>{' '}
							{process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000'}
							/api/auth/callback/google
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
