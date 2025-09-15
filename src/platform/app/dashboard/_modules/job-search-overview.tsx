'use client'

import { useState } from 'react'
import { Bell, Calendar, Search, Settings, Target, TrendingUp } from 'lucide-react'

export function JobSearchOverview() {
	const [searchQuery, setSearchQuery] = useState('')

	const currentDate = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})

	return (
		<div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 p-8 text-white shadow-xl">
			<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
				{/* Welcome Section */}
				<div className="flex-1">
					<div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-100">
						<Calendar className="h-4 w-4" />
						{currentDate}
					</div>
					<h1 className="mb-2 text-3xl font-bold lg:text-4xl">Welcome back! 🚀</h1>
					<p className="text-lg text-indigo-100">
						Let's find your dream job and ace those interviews.
					</p>
				</div>

				{/* Action Bar */}
				<div className="flex items-center gap-4">
					{/* Job Search */}
					<div className="relative">
						<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-indigo-200" />
						<input
							type="text"
							placeholder="Search jobs..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-64 rounded-lg border border-white/20 bg-white/10 py-2 pr-4 pl-10 text-white placeholder-indigo-200 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:ring-white/30 focus:outline-none"
						/>
					</div>

					{/* Notifications */}
					<button className="relative rounded-lg border border-white/20 bg-white/10 p-2 backdrop-blur-sm transition-colors hover:bg-white/20">
						<Bell className="h-4 w-4" />
						<span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
					</button>

					{/* Settings */}
					<button className="rounded-lg border border-white/20 bg-white/10 p-2 backdrop-blur-sm transition-colors hover:bg-white/20">
						<Settings className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* Quick Stats Bar */}
			<div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
				<div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
					<div className="mb-2 flex items-center gap-2">
						<Target className="h-4 w-4 text-indigo-200" />
						<span className="text-xs font-medium text-indigo-100">Applications</span>
					</div>
					<div className="text-2xl font-bold">23</div>
					<div className="text-xs text-indigo-200">This month</div>
				</div>
				<div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
					<div className="mb-2 flex items-center gap-2">
						<Calendar className="h-4 w-4 text-indigo-200" />
						<span className="text-xs font-medium text-indigo-100">Interviews</span>
					</div>
					<div className="text-2xl font-bold">5</div>
					<div className="text-xs text-indigo-200">Scheduled</div>
				</div>
				<div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
					<div className="mb-2 flex items-center gap-2">
						<TrendingUp className="h-4 w-4 text-indigo-200" />
						<span className="text-xs font-medium text-indigo-100">Response Rate</span>
					</div>
					<div className="text-2xl font-bold">34%</div>
					<div className="text-xs text-indigo-200">Above average</div>
				</div>
				<div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
					<div className="mb-2 flex items-center gap-2">
						<Target className="h-4 w-4 text-indigo-200" />
						<span className="text-xs font-medium text-indigo-100">Goal Progress</span>
					</div>
					<div className="text-2xl font-bold">76%</div>
					<div className="text-xs text-indigo-200">Monthly target</div>
				</div>
			</div>
		</div>
	)
}
