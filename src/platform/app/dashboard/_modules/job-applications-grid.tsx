'use client'

import { useState } from 'react'
import {
	Building2,
	Clock,
	DollarSign,
	ExternalLink,
	Filter,
	MapPin,
	MoreHorizontal,
	Plus,
} from 'lucide-react'

const mockApplications = [
	{
		id: '1',
		jobTitle: 'Senior Frontend Developer',
		company: 'TechCorp Inc.',
		location: 'San Francisco, CA',
		salary: '$120k - $150k',
		status: 'interview_scheduled',
		applicationDate: '2025-01-02',
		jobType: 'Full-time',
		jobUrl: 'https://example.com/job/1',
	},
	{
		id: '2',
		jobTitle: 'Product Manager',
		company: 'StartupXYZ',
		location: 'Remote',
		salary: '$100k - $130k',
		status: 'applied',
		applicationDate: '2025-01-01',
		jobType: 'Full-time',
		jobUrl: 'https://example.com/job/2',
	},
	{
		id: '3',
		jobTitle: 'UX Designer',
		company: 'Design Studio',
		location: 'New York, NY',
		salary: '$90k - $110k',
		status: 'interviewed',
		applicationDate: '2024-12-28',
		jobType: 'Full-time',
		jobUrl: 'https://example.com/job/3',
	},
	{
		id: '4',
		jobTitle: 'Full Stack Engineer',
		company: 'InnovateLab',
		location: 'Austin, TX',
		salary: '$110k - $140k',
		status: 'offered',
		applicationDate: '2024-12-25',
		jobType: 'Full-time',
		jobUrl: 'https://example.com/job/4',
	},
	{
		id: '5',
		jobTitle: 'DevOps Engineer',
		company: 'CloudTech',
		location: 'Seattle, WA',
		salary: '$130k - $160k',
		status: 'rejected',
		applicationDate: '2024-12-20',
		jobType: 'Full-time',
		jobUrl: 'https://example.com/job/5',
	},
]

const statusConfig = {
	applied: { label: 'Applied', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
	interview_scheduled: {
		label: 'Interview Scheduled',
		color: 'bg-yellow-100 text-yellow-700',
		dot: 'bg-yellow-500',
	},
	interviewed: {
		label: 'Interviewed',
		color: 'bg-purple-100 text-purple-700',
		dot: 'bg-purple-500',
	},
	offered: { label: 'Offer Received', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
	rejected: { label: 'Not Selected', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
}

export function JobApplicationsGrid() {
	const [filter, setFilter] = useState<string>('all')
	const [sortBy, setSortBy] = useState<string>('date')

	const filteredApplications =
		filter === 'all' ? mockApplications : mockApplications.filter((app) => app.status === filter)

	const getTimeAgo = (dateString: string) => {
		const date = new Date(dateString)
		const now = new Date()
		const diffTime = Math.abs(now.getTime() - date.getTime())
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

		if (diffDays === 1) return '1 day ago'
		if (diffDays < 7) return `${diffDays} days ago`
		if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
		return `${Math.ceil(diffDays / 30)} months ago`
	}

	return (
		<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold text-gray-900">Job Applications</h2>
					<p className="mt-1 text-sm text-gray-600">Track your application progress</p>
				</div>
				<div className="flex items-center gap-3">
					<select
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
						className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
					>
						<option value="all">All Applications</option>
						<option value="applied">Applied</option>
						<option value="interview_scheduled">Interview Scheduled</option>
						<option value="interviewed">Interviewed</option>
						<option value="offered">Offers</option>
						<option value="rejected">Not Selected</option>
					</select>
					<button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
						<Plus className="h-4 w-4" />
						Add Application
					</button>
				</div>
			</div>

			{/* Applications List */}
			<div className="space-y-4">
				{filteredApplications.map((application) => {
					const statusInfo = statusConfig[application.status as keyof typeof statusConfig]

					return (
						<div
							key={application.id}
							className="group rounded-xl border border-gray-200 p-5 transition-all hover:border-gray-300 hover:shadow-sm"
						>
							<div className="flex items-start justify-between">
								{/* Main Content */}
								<div className="flex-1">
									<div className="flex items-start gap-4">
										{/* Company Logo Placeholder */}
										<div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
											<Building2 className="h-6 w-6 text-blue-600" />
										</div>

										{/* Job Details */}
										<div className="min-w-0 flex-1">
											<div className="mb-2 flex items-start justify-between">
												<div>
													<h3 className="mb-1 text-lg font-semibold text-gray-900">
														{application.jobTitle}
													</h3>
													<p className="font-medium text-gray-600">{application.company}</p>
												</div>
												<div className="flex items-center gap-2">
													<span
														className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusInfo.color}`}
													>
														<div className={`h-2 w-2 rounded-full ${statusInfo.dot}`}></div>
														{statusInfo.label}
													</span>
													<button className="rounded-md p-1 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-100">
														<MoreHorizontal className="h-4 w-4 text-gray-400" />
													</button>
												</div>
											</div>

											{/* Job Meta */}
											<div className="mb-3 flex items-center gap-4 text-sm text-gray-600">
												<div className="flex items-center gap-1">
													<MapPin className="h-4 w-4" />
													{application.location}
												</div>
												<div className="flex items-center gap-1">
													<DollarSign className="h-4 w-4" />
													{application.salary}
												</div>
												<div className="flex items-center gap-1">
													<Clock className="h-4 w-4" />
													{getTimeAgo(application.applicationDate)}
												</div>
											</div>

											{/* Actions */}
											<div className="flex items-center gap-3">
												<button className="text-sm font-medium text-blue-600 hover:text-blue-700">
													View Details
												</button>
												<button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-700">
													<ExternalLink className="h-3 w-3" />
													Job Posting
												</button>
												{application.status === 'interview_scheduled' && (
													<button className="text-sm font-medium text-green-600 hover:text-green-700">
														Schedule Interview
													</button>
												)}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					)
				})}
			</div>

			{/* Load More */}
			{filteredApplications.length > 0 && (
				<div className="mt-6 text-center">
					<button className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
						Load more applications
					</button>
				</div>
			)}

			{filteredApplications.length === 0 && (
				<div className="py-12 text-center">
					<Building2 className="mx-auto mb-4 h-12 w-12 text-gray-300" />
					<h3 className="mb-2 font-medium text-gray-900">No applications found</h3>
					<p className="mb-4 text-sm text-gray-600">Start applying to jobs to see them here</p>
					<button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
						Browse Jobs
					</button>
				</div>
			)}
		</div>
	)
}
