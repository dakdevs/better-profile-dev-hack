import { ArrowDownRight, ArrowUpRight, Globe, Shield, Target, Zap } from 'lucide-react'

const metrics = [
	{
		title: 'Conversion Rate',
		value: '3.24%',
		change: '+0.12%',
		trend: 'up' as const,
		icon: Target,
		color: 'text-green-600',
		bgColor: 'bg-green-50',
		description: 'vs last week',
	},
	{
		title: 'Page Load Speed',
		value: '1.2s',
		change: '-0.3s',
		trend: 'up' as const,
		icon: Zap,
		color: 'text-blue-600',
		bgColor: 'bg-blue-50',
		description: 'avg response time',
	},
	{
		title: 'Global Reach',
		value: '47',
		change: '+3',
		trend: 'up' as const,
		icon: Globe,
		color: 'text-purple-600',
		bgColor: 'bg-purple-50',
		description: 'countries served',
	},
	{
		title: 'Security Score',
		value: '98.5%',
		change: '+1.2%',
		trend: 'up' as const,
		icon: Shield,
		color: 'text-emerald-600',
		bgColor: 'bg-emerald-50',
		description: 'threat protection',
	},
]

export function TopMetrics() {
	return (
		<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold text-gray-900">Key Metrics</h2>
					<p className="mt-1 text-sm text-gray-600">Performance indicators</p>
				</div>
			</div>

			<div className="space-y-4">
				{metrics.map((metric) => (
					<div
						key={metric.title}
						className="group"
					>
						<div className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition-all hover:border-gray-200 hover:shadow-sm">
							<div className="flex items-center gap-3">
								<div className={`rounded-lg p-2 ${metric.bgColor}`}>
									<metric.icon className={`h-4 w-4 ${metric.color}`} />
								</div>
								<div>
									<div className="text-sm font-semibold text-gray-900">{metric.title}</div>
									<div className="text-xs text-gray-500">{metric.description}</div>
								</div>
							</div>

							<div className="text-right">
								<div className="font-bold text-gray-900">{metric.value}</div>
								<div
									className={`flex items-center gap-1 text-xs font-medium ${
										metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
									}`}
								>
									{metric.trend === 'up' ? (
										<ArrowUpRight className="h-3 w-3" />
									) : (
										<ArrowDownRight className="h-3 w-3" />
									)}
									{metric.change}
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Summary Card */}
			<div className="mt-6 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
				<div className="flex items-center justify-between">
					<div>
						<div className="text-sm font-medium text-blue-900">Overall Performance</div>
						<div className="mt-1 text-xs text-blue-700">All metrics trending positively</div>
					</div>
					<div className="text-right">
						<div className="text-lg font-bold text-blue-900">Excellent</div>
						<div className="flex items-center gap-1 text-xs font-medium text-green-600">
							<ArrowUpRight className="h-3 w-3" />
							+5.2%
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
