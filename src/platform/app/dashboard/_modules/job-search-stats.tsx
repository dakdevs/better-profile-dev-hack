import { Calendar, CheckCircle, Send, TrendingDown, TrendingUp, XCircle } from 'lucide-react'

const stats = [
	{
		title: 'Applications Sent',
		value: '23',
		change: '+5',
		trend: 'up' as const,
		icon: Send,
		color: 'blue' as const,
		description: 'This month',
	},
	{
		title: 'Interviews Scheduled',
		value: '5',
		change: '+2',
		trend: 'up' as const,
		icon: Calendar,
		color: 'green' as const,
		description: 'Upcoming',
	},
	{
		title: 'Offers Received',
		value: '2',
		change: '+1',
		trend: 'up' as const,
		icon: CheckCircle,
		color: 'purple' as const,
		description: 'Pending response',
	},
	{
		title: 'Applications Rejected',
		value: '8',
		change: '+3',
		trend: 'up' as const,
		icon: XCircle,
		color: 'orange' as const,
		description: 'Learning opportunities',
	},
]

const colorClasses = {
	blue: 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 border-blue-200',
	green: 'bg-gradient-to-br from-green-50 to-green-100 text-green-600 border-green-200',
	orange: 'bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600 border-orange-200',
	purple: 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-600 border-purple-200',
}

const cardGradients = {
	blue: 'hover:shadow-blue-100',
	green: 'hover:shadow-green-100',
	orange: 'hover:shadow-orange-100',
	purple: 'hover:shadow-purple-100',
}

export function JobSearchStats() {
	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{stats.map((stat) => (
				<div
					key={stat.title}
					className={`group relative cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/50 ${cardGradients[stat.color]}`}
				>
					{/* Header */}
					<div className="mb-4 flex items-center justify-between">
						<div className={`rounded-xl border p-3 ${colorClasses[stat.color]}`}>
							<stat.icon className="h-6 w-6" />
						</div>
					</div>

					{/* Value */}
					<div className="mb-3">
						<div className="mb-1 text-3xl font-bold text-gray-900">{stat.value}</div>
						<div className="text-sm font-medium text-gray-600">{stat.title}</div>
					</div>

					{/* Change Indicator */}
					<div className="flex items-center justify-between">
						<div
							className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold ${
								stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
							}`}
						>
							{stat.trend === 'up' ? (
								<TrendingUp className="h-3.5 w-3.5" />
							) : (
								<TrendingDown className="h-3.5 w-3.5" />
							)}
							{stat.change}
						</div>
						<span className="text-xs font-medium text-gray-500">{stat.description}</span>
					</div>

					{/* Subtle background pattern */}
					<div className="absolute top-0 right-0 h-32 w-32 overflow-hidden rounded-2xl opacity-5">
						<stat.icon className="h-full w-full translate-x-8 -translate-y-8 rotate-12 transform" />
					</div>
				</div>
			))}
		</div>
	)
}
