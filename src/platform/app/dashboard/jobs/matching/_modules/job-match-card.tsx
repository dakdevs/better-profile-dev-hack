'use client'

import { useState } from 'react'
import {
	AlertTriangle,
	Building,
	Calendar,
	CheckCircle,
	Clock,
	DollarSign,
	ExternalLink,
	Loader2,
	Mail,
	MapPin,
} from 'lucide-react'

import { ScheduleInterviewButton } from './schedule-interview-button'

// Define interfaces locally to avoid importing server-side code
interface JobListing {
	id: string
	title: string
	company: string
	description: string
	requiredSkills: Skill[]
	preferredSkills?: Skill[]
	location: string
	salaryMin?: number
	salaryMax?: number
	jobType: string
	experienceLevel: string
	remoteAllowed: boolean
	benefits?: string[]
	applicationUrl?: string
	contactEmail?: string
	status: string
	createdAt: Date
	updatedAt: Date
}

interface Skill {
	name: string
	proficiencyScore?: number
	category?: string
}

interface JobMatch {
	job: JobListing
	matchScore: number
	matchingSkills: Skill[]
	skillGaps: Skill[]
	overallFit: 'excellent' | 'good' | 'fair' | 'poor'
}

interface JobMatchCardProps {
	match: JobMatch
}

export function JobMatchCard({ match }: JobMatchCardProps) {
	const { job, matchScore, matchingSkills, skillGaps, overallFit } = match

	const getMatchColor = (score: number) => {
		if (score >= 95) return 'text-green-600 bg-green-50 border-green-200'
		if (score >= 90) return 'text-apple-blue bg-blue-50 border-blue-200'
		return 'text-yellow-600 bg-yellow-50 border-yellow-200'
	}

	const getFitColor = (fit: string) => {
		switch (fit) {
			case 'excellent':
				return 'text-green-600 bg-green-50'
			case 'good':
				return 'text-apple-blue bg-blue-50'
			case 'fair':
				return 'text-yellow-600 bg-yellow-50'
			default:
				return 'text-gray-600 bg-gray-50'
		}
	}

	const formatSalary = (min?: number, max?: number) => {
		if (!min && !max) return 'Salary not specified'
		if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`
		if (min) return `$${(min / 1000).toFixed(0)}k+`
		if (max) return `Up to $${(max / 1000).toFixed(0)}k`
		return 'Competitive salary'
	}

	return (
		<div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
			{/* Header */}
			<div className="border-b border-gray-100 p-6">
				<div className="flex items-start justify-between gap-4">
					<div className="flex-1">
						<div className="mb-2 flex items-center gap-3">
							<h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
							<span
								className={`rounded-full border px-3 py-1 text-sm font-medium ${getMatchColor(matchScore)}`}
							>
								{matchScore}% Match
							</span>
						</div>
						<div className="mb-3 flex items-center gap-2 text-gray-600">
							<Building className="h-4 w-4" />
							<span className="font-medium">{job.company}</span>
							<span className="text-gray-400">•</span>
							<MapPin className="h-4 w-4" />
							<span>{job.location}</span>
							{job.remoteAllowed && (
								<>
									<span className="text-gray-400">•</span>
									<span className="text-sm text-green-600">Remote OK</span>
								</>
							)}
						</div>
						<div className="flex items-center gap-4 text-sm text-gray-600">
							<div className="flex items-center gap-1">
								<DollarSign className="h-4 w-4" />
								<span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
							</div>
							<div className="flex items-center gap-1">
								<Clock className="h-4 w-4" />
								<span className="capitalize">{job.jobType.replace('-', ' ')}</span>
							</div>
							<div className="flex items-center gap-1">
								<span
									className={`rounded-full px-2 py-1 text-xs font-medium ${getFitColor(overallFit)}`}
								>
									{overallFit.charAt(0).toUpperCase() + overallFit.slice(1)} Fit
								</span>
							</div>
						</div>
					</div>
					<ScheduleInterviewButton
						jobId={job.id}
						jobTitle={job.title}
						company={job.company}
					/>
				</div>
			</div>

			{/* Job Description */}
			<div className="border-b border-gray-100 p-6">
				<p className="line-clamp-3 leading-relaxed text-gray-700">{job.description}</p>
			</div>

			{/* Skills Match */}
			<div className="border-b border-gray-100 p-6">
				<div className="grid gap-6 md:grid-cols-2">
					{/* Matching Skills */}
					<div>
						<div className="mb-3 flex items-center gap-2">
							<CheckCircle className="h-4 w-4 text-green-600" />
							<h4 className="font-medium text-gray-900">
								Matching Skills ({matchingSkills.length})
							</h4>
						</div>
						<div className="flex flex-wrap gap-2">
							{matchingSkills.slice(0, 8).map((skill, index) => (
								<span
									key={index}
									className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm text-green-700"
								>
									{skill.name}
								</span>
							))}
							{matchingSkills.length > 8 && (
								<span className="rounded-full bg-gray-50 px-3 py-1 text-sm text-gray-600">
									+{matchingSkills.length - 8} more
								</span>
							)}
						</div>
					</div>

					{/* Skill Gaps */}
					{skillGaps.length > 0 && (
						<div>
							<div className="mb-3 flex items-center gap-2">
								<AlertTriangle className="h-4 w-4 text-yellow-600" />
								<h4 className="font-medium text-gray-900">
									Skills to Develop ({skillGaps.length})
								</h4>
							</div>
							<div className="flex flex-wrap gap-2">
								{skillGaps.slice(0, 6).map((skill, index) => (
									<span
										key={index}
										className="rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-sm text-yellow-700"
									>
										{skill.name}
									</span>
								))}
								{skillGaps.length > 6 && (
									<span className="rounded-full bg-gray-50 px-3 py-1 text-sm text-gray-600">
										+{skillGaps.length - 6} more
									</span>
								)}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Benefits & Contact */}
			<div className="p-6">
				<div className="grid gap-6 md:grid-cols-2">
					{/* Benefits */}
					{job.benefits && job.benefits.length > 0 && (
						<div>
							<h4 className="mb-3 font-medium text-gray-900">Benefits</h4>
							<div className="flex flex-wrap gap-2">
								{job.benefits.slice(0, 4).map((benefit, index) => (
									<span
										key={index}
										className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
									>
										{benefit}
									</span>
								))}
								{job.benefits.length > 4 && (
									<span className="rounded-full bg-gray-50 px-3 py-1 text-sm text-gray-600">
										+{job.benefits.length - 4} more
									</span>
								)}
							</div>
						</div>
					)}

					{/* Contact Info */}
					<div>
						<h4 className="mb-3 font-medium text-gray-900">Contact</h4>
						<div className="space-y-2">
							{job.contactEmail && (
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<Mail className="h-4 w-4" />
									<a
										href={`mailto:${job.contactEmail}`}
										className="hover:text-apple-blue transition-colors"
									>
										{job.contactEmail}
									</a>
								</div>
							)}
							{job.applicationUrl && (
								<div className="flex items-center gap-2 text-sm text-gray-600">
									<ExternalLink className="h-4 w-4" />
									<a
										href={job.applicationUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="hover:text-apple-blue transition-colors"
									>
										Apply Online
									</a>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
