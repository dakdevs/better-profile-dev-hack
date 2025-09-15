import {
	Building2,
	Calendar,
	CheckCircle,
	Clock,
	FileText,
	Filter,
	MoreHorizontal,
	Send,
	XCircle,
} from 'lucide-react'

const iconMap = {
	Send,
	Calendar,
	CheckCircle,
	XCircle,
	FileText,
	Building2,
}

const activities = [
	{
		id: 1,
		type: 'application',
		title: 'Applied to Senior Frontend Developer',
		description: 'TechCorp Inc. - Application submitted successfully',
		time: '2 minutes ago',
		icon: 'Send' as const,
		color: 'bg-blue-50 text-blue-600 border-blue-200',
		priority: 'high',
	},
	{
		id: 2,
		type: 'interview',
		title: 'Interview scheduled',
		description: 'Product Manager role at StartupXYZ - Jan 12, 10:30 AM',
		time: '1 hour ago',
		icon: 'Calendar' as const,
		color: 'bg-green-50 text-green-600 border-green-200',
		priority: 'high',
	},
	{
		id: 3,
		type: 'offer',
		title: 'Job offer received',
		description: 'Full Stack Engineer at InnovateLab - Review by Jan 15',
		time: '2 hours ago',
		icon: 'CheckCircle' as const,
		color: 'bg-purple-50 text-purple-600 border-purple-200',
		priority: 'high',
	},
	{
		id: 4,
		type: 'rejection',
		title: 'Application update',
		description: 'DevOps Engineer at CloudTech - Not selected for this role',
		time: '1 day ago',
		icon: 'XCircle' as const,
		color: 'bg-orange-50 text-orange-600 border-orange-200',
		priority: 'medium',
	},
	{
		id: 5,
		type: 'profile',
		title: 'Resume updated',
		description: 'New version uploaded with recent project experience',
		time: '2 days ago',
		icon: 'FileText' as const,
		color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
		priority: 'low',
	},
	{
		id: 6,
		type: 'company',
		title: 'Company research completed',
		description: 'Added notes for TechCorp Inc. and StartupXYZ',
		time: '3 days ago',
		icon: 'Building2' as const,
		color: 'bg-gray-50 text-gray-600 border-gray-200',
		priority: 'low',
	},
]

const priorityDots = {
	high: 'bg-red-500',
	medium: 'bg-orange-500',
	low: 'bg-gray-400',
}

export function RecentActivity() {
	return (
		<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
					<p className="mt-1 text-sm text-gray-600">Latest updates and events</p>
				</div>
				<div className="flex items-center gap-2">
					<button className="rounded-lg p-2 transition-colors hover:bg-gray-100">
						<Filter className="h-4 w-4 text-gray-600" />
					</button>
					<button className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700">
						View all
					</button>
				</div>
			</div>

			{/* Activity List */}
			<div className="space-y-1">
				{activities.map((activity, index) => {
					const Icon = iconMap[activity.icon]
					return (
						<div
							key={activity.id}
							className="group relative"
						>
							<div className="flex items-start gap-4 rounded-xl p-4 transition-colors hover:bg-gray-50">
								{/* Icon */}
								<div className={`relative rounded-xl border p-2.5 ${activity.color}`}>
									<Icon className="h-4 w-4" />
									<div
										className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${priorityDots[activity.priority as keyof typeof priorityDots]}`}
									></div>
								</div>

								{/* Content */}
								<div className="min-w-0 flex-1">
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1">
											<p className="mb-1 text-sm font-semibold text-gray-900">{activity.title}</p>
											<p className="text-sm leading-relaxed text-gray-600">
												{activity.description}
											</p>
										</div>
										<div className="flex flex-shrink-0 items-center gap-2">
											<div className="flex items-center gap-1 text-xs font-medium text-gray-500">
												<Clock className="h-3 w-3" />
												{activity.time}
											</div>
											<button className="rounded-md p-1 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-200">
												<MoreHorizontal className="h-3 w-3 text-gray-400" />
											</button>
										</div>
									</div>
								</div>
							</div>

							{/* Connector Line */}
							{index < activities.length - 1 && (
								<div className="absolute top-16 left-8 h-4 w-px bg-gray-200"></div>
							)}
						</div>
					)
				})}
			</div>

			{/* Load More */}
			<div className="mt-6 border-t border-gray-100 pt-4">
				<button className="w-full rounded-lg py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
					Load more activities
				</button>
			</div>
		</div>
	)
}
