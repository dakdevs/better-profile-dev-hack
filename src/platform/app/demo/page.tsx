import Link from 'next/link'

import { UserProfileDemo } from '~/components/user-profile-demo'

export default function DemoPage() {
	return (
		<div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">
			<div className="mx-auto max-w-6xl">
				<header className="mb-8">
					<h1 className="mb-2 text-3xl font-bold text-black dark:text-white">
						AI Interview Management System Demo
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Comprehensive demonstration of AI-powered job posting, skill extraction, and candidate
						matching
					</p>
				</header>

				{/* Demo Navigation */}
				<div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
					<Link
						href="/demo/jobs"
						className="group rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-black"
					>
						<div className="mb-4 flex items-center gap-3">
							<div className="bg-apple-blue/10 flex h-12 w-12 items-center justify-center rounded-lg">
								<svg
									className="text-apple-blue h-6 w-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
									/>
								</svg>
							</div>
							<h3 className="group-hover:text-apple-blue text-lg font-semibold text-black transition-colors dark:text-white">
								Job Postings Demo
							</h3>
						</div>
						<p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
							View 25 diverse job postings with AI-powered skill extraction across 5 industries
						</p>
						<div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
							<span>• 25 job postings</span>
							<span>• AI skill extraction</span>
							<span>• 5 industries</span>
						</div>
					</Link>

					<Link
						href="/demo/matching"
						className="group rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-black"
					>
						<div className="mb-4 flex items-center gap-3">
							<div className="bg-apple-green/10 flex h-12 w-12 items-center justify-center rounded-lg">
								<svg
									className="text-apple-green h-6 w-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
							</div>
							<h3 className="group-hover:text-apple-green text-lg font-semibold text-black transition-colors dark:text-white">
								Candidate Matching Demo
							</h3>
						</div>
						<p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
							See AI-powered candidate matching with skill overlap analysis and fit scores
						</p>
						<div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
							<span>• Smart matching</span>
							<span>• Skill analysis</span>
							<span>• Fit scoring</span>
						</div>
					</Link>

					<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
						<div className="mb-4 flex items-center gap-3">
							<div className="bg-apple-purple/10 flex h-12 w-12 items-center justify-center rounded-lg">
								<svg
									className="text-apple-purple h-6 w-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-black dark:text-white">User Skills Demo</h3>
						</div>
						<p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
							Interactive user skills and interview sessions demonstration
						</p>
						<div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
							<span>• User profiles</span>
							<span>• Skill tracking</span>
							<span>• Sessions</span>
						</div>
					</div>
				</div>

				<UserProfileDemo />

				<footer className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
					<div className="text-center text-sm text-gray-600 dark:text-gray-400">
						<p className="mb-2">
							Complete AI-powered interview management system with job posting, skill extraction,
							and candidate matching
						</p>
						<div className="flex justify-center gap-4 text-xs">
							<span>• 25 diverse job postings across 5 industries</span>
							<span>• 24 candidates with 233 total skills</span>
							<span>• AI skill extraction with 70-90% confidence</span>
							<span>• Smart candidate matching algorithm</span>
						</div>
					</div>
				</footer>
			</div>
		</div>
	)
}
