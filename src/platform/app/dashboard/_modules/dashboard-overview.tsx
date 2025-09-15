'use client'

import { useState } from 'react'
import { Bell, Calendar, Filter, Search } from 'lucide-react'

export function DashboardOverview() {
	const [searchQuery, setSearchQuery] = useState('')

	const currentDate = new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})

	return (
		<div className="rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-xl">
			<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
				{/* Welcome Section */}
				<div className="flex-1">
					<div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-100">
						<Calendar className="h-4 w-4" />
						{currentDate}
					</div>
					<h1 className="mb-2 text-3xl font-bold lg:text-4xl">Good morning, Alex! 👋</h1>
					<p className="text-lg text-blue-100">Here's what's happening with your business today.</p>
				</div>

				{/* Action Bar */}
				<div className="flex items-center gap-4">
					{/* Search */}
					<div className="relative">
						<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-blue-200" />
						<input
							type="text"
							placeholder="Search..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-64 rounded-lg border border-white/20 bg-white/10 py-2 pr-4 pl-10 text-white placeholder-blue-200 backdrop-blur-sm focus:border-transparent focus:ring-2 focus:ring-white/30 focus:outline-none"
						/>
					</div>

					{/* Filter Button */}
					<button className="rounded-lg border border-white/20 bg-white/10 p-2 backdrop-blur-sm transition-colors hover:bg-white/20">
						<Filter className="h-4 w-4" />
					</button>

					{/* Notifications */}
					<button className="relative rounded-lg border border-white/20 bg-white/10 p-2 backdrop-blur-sm transition-colors hover:bg-white/20">
						<Bell className="h-4 w-4" />
						<span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
					</button>
				</div>
			</div>

			{/* Quick Stats Bar */}
			<div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
				<div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
					<div className="text-2xl font-bold">98.5%</div>
					<div className="text-sm text-blue-100">Uptime</div>
				</div>
				<div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
					<div className="text-2xl font-bold">2.4s</div>
					<div className="text-sm text-blue-100">Avg Response</div>
				</div>
				<div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
					<div className="text-2xl font-bold">156</div>
					<div className="text-sm text-blue-100">Active Users</div>
				</div>
				<div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
					<div className="text-2xl font-bold">$12.4k</div>
					<div className="text-sm text-blue-100">Today's Revenue</div>
				</div>
			</div>
		</div>
	)
}
