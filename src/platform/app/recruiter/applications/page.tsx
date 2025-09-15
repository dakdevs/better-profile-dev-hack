export default function ApplicationsPage() {
	return (
		<div className="space-y-8">
			<div>
				<h1 className="mb-2 text-3xl font-semibold text-black dark:text-white">Job Applications</h1>
				<p className="text-gray-600 dark:text-gray-400">Review and manage candidate applications</p>
			</div>

			{/* Filters */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
				<div className="flex flex-wrap gap-4">
					<select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-black dark:border-gray-700 dark:bg-black dark:text-white">
						<option>All Jobs</option>
						<option>Senior Software Engineer</option>
						<option>Product Manager</option>
					</select>
					<select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-black dark:border-gray-700 dark:bg-black dark:text-white">
						<option>All Status</option>
						<option>Pending</option>
						<option>Reviewing</option>
						<option>Interview Scheduled</option>
						<option>Rejected</option>
						<option>Hired</option>
					</select>
					<input
						type="text"
						placeholder="Search candidates..."
						className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-black dark:border-gray-700 dark:bg-black dark:text-white"
					/>
				</div>
			</div>

			{/* Applications List */}
			<div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-black">
				<div className="border-b border-gray-200 p-6 dark:border-gray-700">
					<h2 className="text-lg font-semibold text-black dark:text-white">Recent Applications</h2>
				</div>

				<div className="divide-y divide-gray-200 dark:divide-gray-700">
					{/* Sample Application */}
					<div className="p-6 transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-900">
						<div className="flex items-start justify-between">
							<div className="flex items-start gap-4">
								<div className="from-apple-blue to-apple-purple flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white">
									JD
								</div>
								<div>
									<h3 className="text-lg font-semibold text-black dark:text-white">John Doe</h3>
									<p className="mb-2 text-gray-600 dark:text-gray-400">
										Applied for Senior Software Engineer
									</p>
									<div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
										<span>Applied 2 days ago</span>
										<span>•</span>
										<span>5 years experience</span>
										<span>•</span>
										<span>San Francisco, CA</span>
									</div>
									<div className="mt-2 flex items-center gap-2">
										<span className="bg-apple-blue/10 text-apple-blue rounded px-2 py-1 text-xs">
											React
										</span>
										<span className="bg-apple-blue/10 text-apple-blue rounded px-2 py-1 text-xs">
											TypeScript
										</span>
										<span className="bg-apple-blue/10 text-apple-blue rounded px-2 py-1 text-xs">
											Node.js
										</span>
									</div>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<span className="bg-apple-orange/10 text-apple-orange rounded-full px-3 py-1 text-sm">
									Pending Review
								</span>
								<button className="bg-apple-blue rounded-lg px-4 py-2 text-sm text-white transition-colors duration-150 hover:bg-blue-600">
									Review
								</button>
							</div>
						</div>
					</div>

					{/* Another Sample Application */}
					<div className="p-6 transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-900">
						<div className="flex items-start justify-between">
							<div className="flex items-start gap-4">
								<div className="from-apple-green to-apple-teal flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white">
									JS
								</div>
								<div>
									<h3 className="text-lg font-semibold text-black dark:text-white">Jane Smith</h3>
									<p className="mb-2 text-gray-600 dark:text-gray-400">
										Applied for Product Manager
									</p>
									<div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
										<span>Applied 1 week ago</span>
										<span>•</span>
										<span>8 years experience</span>
										<span>•</span>
										<span>Remote</span>
									</div>
									<div className="mt-2 flex items-center gap-2">
										<span className="bg-apple-green/10 text-apple-green rounded px-2 py-1 text-xs">
											Product Strategy
										</span>
										<span className="bg-apple-green/10 text-apple-green rounded px-2 py-1 text-xs">
											Analytics
										</span>
										<span className="bg-apple-green/10 text-apple-green rounded px-2 py-1 text-xs">
											Leadership
										</span>
									</div>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<span className="bg-apple-green/10 text-apple-green rounded-full px-3 py-1 text-sm">
									Interview Scheduled
								</span>
								<button className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
									View Details
								</button>
							</div>
						</div>
					</div>

					{/* Empty State */}
					<div className="p-12 text-center">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
							<svg
								className="h-8 w-8 text-gray-400 dark:text-gray-500"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
						</div>
						<h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
							No more applications
						</h3>
						<p className="text-gray-500 dark:text-gray-400">
							You've reviewed all current applications. New applications will appear here.
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
