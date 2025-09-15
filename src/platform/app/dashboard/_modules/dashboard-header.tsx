'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, Search, User, X } from 'lucide-react'

import { NotificationBell } from '~/components/notification-bell'

import { MobileMenu } from './mobile-menu'
import { UserMenu } from './user-menu'

interface DashboardHeaderProps {
	user: {
		id: string
		name: string
		email: string
		image?: string
	}
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	return (
		<>
			<header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
				<div className="flex h-16 items-center justify-between px-4 md:px-6">
					{/* Left side - Logo and mobile menu */}
					<div className="flex items-center gap-4">
						<button
							onClick={() => setIsMobileMenuOpen(true)}
							className="p-2 text-gray-600 hover:text-gray-900 md:hidden"
						>
							<Menu className="h-5 w-5" />
						</button>

						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
								<span className="text-sm font-bold text-white">D</span>
							</div>
							<span className="hidden font-semibold text-gray-900 sm:block">Dashboard</span>
						</div>
					</div>

					{/* Center - Search (hidden on mobile) */}
					<div className="mx-8 hidden max-w-md flex-1 md:block">
						<div className="relative">
							<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
							<input
								type="text"
								placeholder="Search..."
								className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
							/>
						</div>
					</div>

					{/* Right side - For Recruiters, Notifications and user menu */}
					<div className="flex items-center gap-2">
						{/* Desktop For Recruiters Button */}
						<Link
							href="/recruiter"
							className="bg-apple-blue hidden items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-600 sm:inline-flex"
						>
							<svg
								className="h-4 w-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8z"
								/>
							</svg>
							For Recruiters
						</Link>

						{/* Mobile For Recruiters Button */}
						<Link
							href="/recruiter"
							className="bg-apple-blue rounded-lg p-2 text-white transition-colors duration-150 hover:bg-blue-600 sm:hidden"
							title="For Recruiters"
						>
							<svg
								className="h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8z"
								/>
							</svg>
						</Link>

						<NotificationBell />

						<UserMenu user={user} />
					</div>
				</div>
			</header>

			<MobileMenu
				isOpen={isMobileMenuOpen}
				onClose={() => setIsMobileMenuOpen(false)}
			/>
		</>
	)
}
