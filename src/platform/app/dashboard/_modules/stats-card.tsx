import {
	Activity,
	DollarSign,
	MoreHorizontal,
	ShoppingCart,
	TrendingDown,
	TrendingUp,
	Users,
} from 'lucide-react'

import { cn } from '~/lib/utils'

const iconMap = {
	Users,
	DollarSign,
	ShoppingCart,
	Activity,
}

interface StatsCardProps {
	title: string
	value: string
	change: string
	trend: 'up' | 'down'
	icon: keyof typeof iconMap
	color: 'blue' | 'green' | 'orange' | 'purple'
}

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

export function StatsCard({ title, value, change, trend, icon, color }: StatsCardProps) {
	const Icon = iconMap[icon]
	return (
		<div
			className={cn(
				'group relative cursor-pointer rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-gray-200/50',
				cardGradients[color],
			)}
		>
			{/* Header */}
			<div className="mb-4 flex items-center justify-between">
				<div className={cn('rounded-xl border p-3', colorClasses[color])}>
					<Icon className="h-6 w-6" />
				</div>
				<button className="rounded-lg p-1 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-100">
					<MoreHorizontal className="h-4 w-4 text-gray-400" />
				</button>
			</div>

			{/* Value */}
			<div className="mb-3">
				<div className="mb-1 text-3xl font-bold text-gray-900">{value}</div>
				<div className="text-sm font-medium text-gray-600">{title}</div>
			</div>

			{/* Change Indicator */}
			<div className="flex items-center justify-between">
				<div
					className={cn(
						'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold',
						trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
					)}
				>
					{trend === 'up' ? (
						<TrendingUp className="h-3.5 w-3.5" />
					) : (
						<TrendingDown className="h-3.5 w-3.5" />
					)}
					{change}
				</div>
				<span className="text-xs font-medium text-gray-500">vs last month</span>
			</div>

			{/* Subtle background pattern */}
			<div className="absolute top-0 right-0 h-32 w-32 overflow-hidden rounded-2xl opacity-5">
				<Icon className="h-full w-full translate-x-8 -translate-y-8 rotate-12 transform" />
			</div>
		</div>
	)
}
