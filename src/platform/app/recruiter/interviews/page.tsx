import { Suspense } from 'react'

import { InterviewManagementPage } from './_modules/interview-management-page'

export default function RecruiterInterviewsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-semibold text-black dark:text-white">Interview Management</h1>
				<p className="mt-1 text-gray-600 dark:text-gray-400">
					Manage your scheduled interviews and candidate interactions
				</p>
			</div>

			<Suspense
				fallback={
					<div className="space-y-4">
						{[...Array(3)].map((_, i) => (
							<div
								key={i}
								className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black"
							>
								<div className="animate-pulse">
									<div className="mb-2 h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
									<div className="mb-4 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
									<div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
								</div>
							</div>
						))}
					</div>
				}
			>
				<InterviewManagementPage />
			</Suspense>
		</div>
	)
}
