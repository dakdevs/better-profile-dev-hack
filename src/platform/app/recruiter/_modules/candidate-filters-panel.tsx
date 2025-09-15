'use client'

import { useEffect, useState } from 'react'

import { CandidateFilters, ExperienceLevel } from '~/types/interview-management'

interface CandidateFiltersPanelProps {
	filters: CandidateFilters
	onFiltersChange: (filters: CandidateFilters) => void
	onClose: () => void
}

const experienceLevels: { value: ExperienceLevel; label: string }[] = [
	{ value: 'entry', label: 'Entry Level' },
	{ value: 'mid', label: 'Mid Level' },
	{ value: 'senior', label: 'Senior Level' },
	{ value: 'executive', label: 'Executive' },
	{ value: 'intern', label: 'Intern' },
]

export function CandidateFiltersPanel({
	filters,
	onFiltersChange,
	onClose,
}: CandidateFiltersPanelProps) {
	const [localFilters, setLocalFilters] = useState<CandidateFilters>(filters)
	const [skillsInput, setSkillsInput] = useState('')

	// Initialize skills input from filters
	useEffect(() => {
		if (filters.skills) {
			setSkillsInput(filters.skills.join(', '))
		}
	}, [filters.skills])

	// Handle skills input change
	const handleSkillsChange = (value: string) => {
		setSkillsInput(value)
		const skills = value
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)

		setLocalFilters((prev) => ({
			...prev,
			skills: skills.length > 0 ? skills : undefined,
		}))
	}

	// Handle experience level toggle
	const handleExperienceLevelToggle = (level: ExperienceLevel) => {
		setLocalFilters((prev) => {
			const currentLevels = prev.experienceLevel || []
			const isSelected = currentLevels.includes(level)

			let newLevels: ExperienceLevel[]
			if (isSelected) {
				newLevels = currentLevels.filter((l) => l !== level)
			} else {
				newLevels = [...currentLevels, level]
			}

			return {
				...prev,
				experienceLevel: newLevels.length > 0 ? newLevels : undefined,
			}
		})
	}

	// Handle location change
	const handleLocationChange = (value: string) => {
		setLocalFilters((prev) => ({
			...prev,
			location: value.trim() || undefined,
		}))
	}

	// Handle remote only toggle
	const handleRemoteOnlyToggle = () => {
		setLocalFilters((prev) => ({
			...prev,
			remoteOnly: prev.remoteOnly ? undefined : true,
		}))
	}

	// Handle minimum match score change
	const handleMinMatchScoreChange = (value: string) => {
		const score = parseInt(value)
		setLocalFilters((prev) => ({
			...prev,
			minMatchScore: isNaN(score) ? undefined : score,
		}))
	}

	// Handle availability date changes
	const handleAvailabilityChange = (field: 'startDate' | 'endDate' | 'timezone', value: string) => {
		setLocalFilters((prev) => ({
			...prev,
			availability: {
				...prev.availability,
				[field]: value.trim() || undefined,
			},
		}))
	}

	// Apply filters
	const handleApplyFilters = () => {
		onFiltersChange(localFilters)
		onClose()
	}

	// Clear all filters
	const handleClearFilters = () => {
		const clearedFilters: CandidateFilters = {}
		setLocalFilters(clearedFilters)
		setSkillsInput('')
		onFiltersChange(clearedFilters)
	}

	// Count active filters
	const activeFiltersCount = Object.keys(localFilters).filter((key) => {
		const value = localFilters[key as keyof CandidateFilters]
		if (Array.isArray(value)) return value.length > 0
		if (typeof value === 'object' && value !== null) {
			return Object.values(value).some((v) => v !== undefined && v !== '')
		}
		return value !== undefined && value !== ''
	}).length

	return (
		<div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-semibold text-black dark:text-white">Filter Candidates</h3>
					{activeFiltersCount > 0 && (
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
						</p>
					)}
				</div>
				<button
					onClick={onClose}
					className="p-2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
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
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{/* Skills filter */}
				<div>
					<label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
						Required Skills
					</label>
					<input
						type="text"
						value={skillsInput}
						onChange={(e) => handleSkillsChange(e.target.value)}
						placeholder="e.g. JavaScript, React, Node.js"
						className="focus:border-apple-blue w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-black placeholder-gray-400 focus:outline-none dark:border-gray-700 dark:bg-black dark:text-white dark:placeholder-gray-500"
					/>
					<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
						Separate multiple skills with commas
					</p>
				</div>

				{/* Experience level filter */}
				<div>
					<label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
						Experience Level
					</label>
					<div className="space-y-2">
						{experienceLevels.map((level) => (
							<label
								key={level.value}
								className="flex items-center"
							>
								<input
									type="checkbox"
									checked={localFilters.experienceLevel?.includes(level.value) || false}
									onChange={() => handleExperienceLevelToggle(level.value)}
									className="text-apple-blue focus:ring-apple-blue h-4 w-4 rounded border-gray-300 dark:border-gray-600"
								/>
								<span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{level.label}</span>
							</label>
						))}
					</div>
				</div>

				{/* Location filter */}
				<div>
					<label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
						Location
					</label>
					<input
						type="text"
						value={localFilters.location || ''}
						onChange={(e) => handleLocationChange(e.target.value)}
						placeholder="e.g. San Francisco, CA"
						className="focus:border-apple-blue w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-black placeholder-gray-400 focus:outline-none dark:border-gray-700 dark:bg-black dark:text-white dark:placeholder-gray-500"
					/>

					{/* Remote only toggle */}
					<label className="mt-2 flex items-center">
						<input
							type="checkbox"
							checked={localFilters.remoteOnly || false}
							onChange={handleRemoteOnlyToggle}
							className="text-apple-blue focus:ring-apple-blue h-4 w-4 rounded border-gray-300 dark:border-gray-600"
						/>
						<span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
							Remote candidates only
						</span>
					</label>
				</div>

				{/* Minimum match score */}
				<div>
					<label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
						Minimum Match Score
					</label>
					<div className="flex items-center gap-2">
						<input
							type="range"
							min="0"
							max="100"
							step="5"
							value={localFilters.minMatchScore || 30}
							onChange={(e) => handleMinMatchScoreChange(e.target.value)}
							className="flex-1"
						/>
						<span className="min-w-[3rem] text-sm font-medium text-gray-700 dark:text-gray-300">
							{localFilters.minMatchScore || 30}%
						</span>
					</div>
					<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
						Only show candidates with at least this match score
					</p>
				</div>

				{/* Availability filter */}
				<div className="md:col-span-2">
					<label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
						Availability Window
					</label>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
						<input
							type="date"
							value={localFilters.availability?.startDate || ''}
							onChange={(e) => handleAvailabilityChange('startDate', e.target.value)}
							className="focus:border-apple-blue rounded-lg border border-gray-200 bg-white px-3 py-2 text-black focus:outline-none dark:border-gray-700 dark:bg-black dark:text-white"
							placeholder="Start date"
						/>
						<input
							type="date"
							value={localFilters.availability?.endDate || ''}
							onChange={(e) => handleAvailabilityChange('endDate', e.target.value)}
							className="focus:border-apple-blue rounded-lg border border-gray-200 bg-white px-3 py-2 text-black focus:outline-none dark:border-gray-700 dark:bg-black dark:text-white"
							placeholder="End date"
						/>
						<select
							value={localFilters.availability?.timezone || ''}
							onChange={(e) => handleAvailabilityChange('timezone', e.target.value)}
							className="focus:border-apple-blue rounded-lg border border-gray-200 bg-white px-3 py-2 text-black focus:outline-none dark:border-gray-700 dark:bg-black dark:text-white"
						>
							<option value="">Any timezone</option>
							<option value="America/New_York">Eastern Time</option>
							<option value="America/Chicago">Central Time</option>
							<option value="America/Denver">Mountain Time</option>
							<option value="America/Los_Angeles">Pacific Time</option>
							<option value="UTC">UTC</option>
						</select>
					</div>
					<p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
						Show candidates available during this time period
					</p>
				</div>
			</div>

			{/* Actions */}
			<div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
				<button
					onClick={handleClearFilters}
					className="px-4 py-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
				>
					Clear All Filters
				</button>

				<div className="flex items-center gap-2">
					<button
						onClick={onClose}
						className="rounded-lg border border-gray-200 px-4 py-2 text-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
					>
						Cancel
					</button>
					<button
						onClick={handleApplyFilters}
						className="bg-apple-blue rounded-lg px-4 py-2 text-sm text-white transition-colors hover:bg-blue-600"
					>
						Apply Filters
					</button>
				</div>
			</div>
		</div>
	)
}
