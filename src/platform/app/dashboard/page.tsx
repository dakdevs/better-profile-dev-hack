import { JobApplicationsGrid } from './_modules/job-applications-grid'
import { JobSearchOverview } from './_modules/job-search-overview'
import { JobSearchStats } from './_modules/job-search-stats'
import { QuickActions } from './_modules/quick-actions'
import { RecentActivity } from './_modules/recent-activity'
import { UpcomingInterviews } from './_modules/upcoming-interviews'

export default function DashboardPage() {
	return (
		<div className="space-y-8">
			{/* Welcome Header */}
			<JobSearchOverview />

			{/* Job Search Statistics */}
			<JobSearchStats />

			{/* Main Content Grid */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Job Applications */}
				<div className="space-y-6 lg:col-span-2">
					<JobApplicationsGrid />
					<RecentActivity />
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					<UpcomingInterviews />
					<QuickActions />
				</div>
			</div>
		</div>
	)
}
