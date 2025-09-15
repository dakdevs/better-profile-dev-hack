import { Suspense } from 'react'

import { LoadingFallback } from '~/components/loading-fallback'

import { MonitoringDashboard } from './_modules/monitoring-dashboard'

export default function MonitoringPage() {
	return (
		<div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
			<div className="mx-auto max-w-7xl">
				<div className="mb-8">
					<h1 className="mb-2 text-3xl font-bold text-black dark:text-white">System Monitoring</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Monitor the health and performance of the interview management system
					</p>
				</div>

				<Suspense fallback={<LoadingFallback message="Loading monitoring data..." />}>
					<MonitoringDashboard />
				</Suspense>
			</div>
		</div>
	)
}
