'use client'

import React, { useState } from 'react'

import { CandidateWithMatch } from '~/types/interview-management'

import { SkillMatchIndicator } from './skill-match-indicator'

interface CandidateCardProps {
	candidateMatch: CandidateWithMatch
	jobId: string
	onScheduleInterview?: (candidateId: string) => void
}

export function CandidateCard({ candidateMatch, jobId, onScheduleInterview }: CandidateCardProps) {
	const [expanded, setExpanded] = useState(false)
	const { candidate, match } = candidateMatch

	// Get match score color
	const getMatchScoreColor = (score: number) => {
		if (score >= 80) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
		if (score >= 60) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
		if (score >= 40) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
		return 'text-red-600 bg-red-50 dark:bg-red-900/20'
	}

	// Get overall fit badge color
	const getFitBadgeColor = (fit: string) => {
		switch (fit) {
			case 'excellent':
				return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
			case 'good':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
			case 'fair':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
			case 'poor':
				return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
		}
	}

	const handleScheduleInterview = () => {
		if (onScheduleInterview) {
			onScheduleInterview(candidate.id)
		}
	}

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-black">
			{/* Header */}
			<div className="mb-4 flex items-start justify-between">
				<div className="min-w-0 flex-1">
					<div className="mb-2 flex items-center gap-3">
						{/* Avatar placeholder */}
						<div className="from-apple-blue to-apple-purple flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-lg font-semibold text-white">
							{candidate.name.charAt(0).toUpperCase()}
						</div>

						<div className="min-w-0 flex-1">
							<h3 className="truncate text-lg font-semibold text-black dark:text-white">
								{candidate.name}
							</h3>
							<p className="truncate text-sm text-gray-600 dark:text-gray-400">{candidate.email}</p>
						</div>
					</div>

					{/* Experience level and location */}
					<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
						{candidate.experienceLevel && (
							<span className="rounded-md bg-gray-100 px-2 py-1 capitalize dark:bg-gray-800">
								{candidate.experienceLevel}
							</span>
						)}
						{candidate.location && (
							<span className="flex items-center gap-1">
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
										d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
								{candidate.location}
							</span>
						)}
					</div>
				</div>

				{/* Match score and fit */}
				<div className="flex flex-col items-end gap-2">
					<div
						className={`rounded-full px-3 py-1 text-sm font-semibold ${getMatchScoreColor(match.score)}`}
					>
						{match.score}% match
					</div>
					<span
						className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${getFitBadgeColor(match.overallFit)}`}
					>
						{match.overallFit} fit
					</span>
				</div>
			</div>

			{/* Skills preview */}
			<div className="mb-4">
				<div className="mb-2 flex items-center justify-between">
					<h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
						Matching Skills ({match.matchingSkills.length})
					</h4>
					<button
						onClick={() => setExpanded(!expanded)}
						className="text-apple-blue text-sm transition-colors hover:text-blue-600"
					>
						{expanded ? 'Show less' : 'Show more'}
					</button>
				</div>

				<div className="flex flex-wrap gap-2">
					{match.matchingSkills.slice(0, expanded ? undefined : 6).map((skill, index) => (
						<SkillMatchIndicator
							key={index}
							skill={skill}
							candidateSkill={candidate.skills.find(
								(s) => s.name.toLowerCase() === skill.name.toLowerCase(),
							)}
						/>
					))}
					{!expanded && match.matchingSkills.length > 6 && (
						<span className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">
							+{match.matchingSkills.length - 6} more
						</span>
					)}
				</div>
			</div>

			{/* Expanded details */}
			{expanded && (
				<div className="space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700">
					{/* All candidate skills */}
					{candidate.skills.length > 0 && (
						<div>
							<h5 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
								All Skills ({candidate.skills.length})
							</h5>
							<div className="flex flex-wrap gap-2">
								{candidate.skills.map((skill, index) => (
									<span
										key={index}
										className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300"
									>
										{skill.name}
										{skill.proficiencyScore && (
											<span className="ml-1 text-xs text-gray-500">
												({skill.proficiencyScore}%)
											</span>
										)}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Skill gaps */}
					{match.skillGaps && match.skillGaps.length > 0 && (
						<div>
							<h5 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
								Missing Skills ({match.skillGaps.length})
							</h5>
							<div className="flex flex-wrap gap-2">
								{match.skillGaps.map((skill, index) => (
									<span
										key={index}
										className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
									>
										{skill.name}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Availability preview */}
					{match.availability && match.availability.length > 0 && (
						<div>
							<h5 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
								Availability ({match.availability.length} slots)
							</h5>
							<div className="text-sm text-gray-600 dark:text-gray-400">
								{match.availability.slice(0, 3).map((slot, index) => (
									<div
										key={index}
										className="flex items-center gap-2"
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
												d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
										{new Date(slot.startTime).toLocaleDateString()} -{' '}
										{new Date(slot.endTime).toLocaleDateString()}
									</div>
								))}
								{match.availability.length > 3 && (
									<div className="mt-1 text-xs text-gray-500">
										+{match.availability.length - 3} more slots
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			)}

			{/* Actions */}
			<div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
				<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					{match.matchingSkills.length} skills match
				</div>

				<div className="flex items-center gap-2">
					<button
						onClick={() => setExpanded(!expanded)}
						className="px-3 py-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
					>
						{expanded ? 'Less details' : 'View details'}
					</button>

					<button
						onClick={handleScheduleInterview}
						className="bg-apple-blue rounded-lg px-4 py-2 text-sm text-white transition-colors hover:bg-blue-600"
					>
						Schedule Interview
					</button>
				</div>
			</div>
		</div>
	)
}
