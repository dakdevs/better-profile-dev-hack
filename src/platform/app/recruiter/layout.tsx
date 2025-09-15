import { headers } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { ErrorBoundary } from '~/components/error-boundary'
import { NotificationBell } from '~/components/notification-bell'
import { auth } from '~/lib/auth'

export default async function RecruiterLayout({ children }: { children: React.ReactNode }) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user) {
		redirect('/auth/signin')
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-black">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center gap-8">
							<h1 className="text-xl font-semibold text-black dark:text-white">
								Recruiter Dashboard
							</h1>
							<nav className="flex gap-6">
								<Link
									href="/recruiter/profile"
									className="text-gray-600 transition-colors duration-150 hover:text-black dark:text-gray-400 hover:dark:text-white"
								>
									Profile
								</Link>
								<Link
									href="/recruiter/jobs"
									className="text-gray-600 transition-colors duration-150 hover:text-black dark:text-gray-400 hover:dark:text-white"
								>
									Jobs
								</Link>
								<Link
									href="/recruiter/post-job"
									className="text-gray-600 transition-colors duration-150 hover:text-black dark:text-gray-400 hover:dark:text-white"
								>
									Post Job
								</Link>
								<Link
									href="/recruiter/calendar"
									className="text-gray-600 transition-colors duration-150 hover:text-black dark:text-gray-400 hover:dark:text-white"
								>
									Calendar
								</Link>
								<Link
									href="/recruiter/interviews"
									className="text-gray-600 transition-colors duration-150 hover:text-black dark:text-gray-400 hover:dark:text-white"
								>
									Interviews
								</Link>
								<Link
									href="/recruiter/applications"
									className="text-gray-600 transition-colors duration-150 hover:text-black dark:text-gray-400 hover:dark:text-white"
								>
									Applications
								</Link>
							</nav>
						</div>
						<div className="flex items-center gap-4">
							<NotificationBell />
							<span className="text-sm text-gray-600 dark:text-gray-400">{session.user.name}</span>
							<Link
								href="/dashboard"
								className="text-apple-blue text-sm transition-colors duration-150 hover:text-blue-600"
							>
								Back to Dashboard
							</Link>
						</div>
					</div>
				</div>
			</header>
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				<ErrorBoundary>{children}</ErrorBoundary>
			</main>
		</div>
	)
}
