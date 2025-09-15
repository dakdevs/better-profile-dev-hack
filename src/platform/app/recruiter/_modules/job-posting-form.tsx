'use client'

import React, { useState } from 'react'

import {
	CreateJobPostingRequest,
	CreateJobPostingResponse,
	EmploymentType,
	ExperienceLevel,
	JobAnalysisResult,
} from '~/types/interview-management'

import { JobImportForm } from './job-import-form'

interface JobImportData {
	title: string
	company: string
	location: string
	description: string
	rawDescription: string
	url: string
}

interface JobPostingFormProps {
	onSubmit: (data: CreateJobPostingRequest) => Promise<CreateJobPostingResponse>
	onCancel?: () => void
	isLoading?: boolean
}

export function JobPostingForm({ onSubmit, onCancel, isLoading = false }: JobPostingFormProps) {
	const [formData, setFormData] = useState<CreateJobPostingRequest>({
		title: '',
		description: '',
		location: '',
		remoteAllowed: false,
		employmentType: 'full-time',
		experienceLevel: undefined,
		salaryMin: undefined,
		salaryMax: undefined,
		requiredSkills: [],
		preferredSkills: [],
	})

	const [errors, setErrors] = useState<Record<string, string>>({})
	const [analysisResult, setAnalysisResult] = useState<JobAnalysisResult | null>(null)
	const [showAnalysis, setShowAnalysis] = useState(false)
	const [showImportForm, setShowImportForm] = useState(false)

	const handleInputChange = (field: keyof CreateJobPostingRequest, value: any) => {
		console.log('[JOB-POSTING-FORM] Field changed:', field, 'value:', value)
		setFormData((prev) => ({ ...prev, [field]: value }))
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: '' }))
		}
	}

	const handleSkillsChange = (field: 'requiredSkills' | 'preferredSkills', value: string) => {
		// Split by comma and clean up each skill
		const skills = value
			.split(',')
			.map((skill) => skill.trim())
			.filter((skill) => skill.length > 0 && skill.length <= 100) // Validate length per skill

		console.log('[JOB-POSTING-FORM] Skills changed for', field, ':', skills)
		handleInputChange(field, skills)

		// Clear any validation errors for this field
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: '' }))
		}
	}

	const validateForm = (): boolean => {
		console.log('[JOB-POSTING-FORM] Validating form data:', formData)
		const newErrors: Record<string, string> = {}

		if (!formData.title.trim()) {
			newErrors.title = 'Job title is required'
		} else if (formData.title.trim().length > 200) {
			newErrors.title = 'Job title must be less than 200 characters'
		}

		if (!formData.description.trim()) {
			newErrors.description = 'Job description is required'
		} else if (formData.description.trim().length < 10) {
			newErrors.description = 'Job description must be at least 10 characters'
		} else if (formData.description.trim().length > 10000) {
			newErrors.description = 'Job description must be less than 10,000 characters'
		}

		if (formData.location && formData.location.length > 200) {
			newErrors.location = 'Location must be less than 200 characters'
		}

		if (formData.salaryMin && formData.salaryMax && formData.salaryMin > formData.salaryMax) {
			newErrors.salaryMax = 'Maximum salary must be greater than minimum salary'
		}

		if (formData.requiredSkills && formData.requiredSkills.length > 50) {
			newErrors.requiredSkills = 'Too many required skills (maximum 50)'
		}

		if (formData.preferredSkills && formData.preferredSkills.length > 50) {
			newErrors.preferredSkills = 'Too many preferred skills (maximum 50)'
		}

		// Validate individual skill lengths
		if (formData.requiredSkills) {
			const longSkills = formData.requiredSkills.filter((skill) => skill.length > 100)
			if (longSkills.length > 0) {
				newErrors.requiredSkills = 'Some required skills are too long (maximum 100 characters each)'
			}
		}

		if (formData.preferredSkills) {
			const longSkills = formData.preferredSkills.filter((skill) => skill.length > 100)
			if (longSkills.length > 0) {
				newErrors.preferredSkills =
					'Some preferred skills are too long (maximum 100 characters each)'
			}
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		console.log('[JOB-POSTING-FORM] Form submitted')

		if (!validateForm()) {
			console.log('[JOB-POSTING-FORM] Form validation failed')
			return
		}
		console.log('[JOB-POSTING-FORM] Form validation passed, submitting data:', formData)

		try {
			console.log('[JOB-POSTING-FORM] Calling onSubmit with form data')
			const result = await onSubmit(formData)
			console.log('[JOB-POSTING-FORM] Submit result:', result)

			if (result.success && result.data) {
				console.log('[JOB-POSTING-FORM] Job posting created successfully, showing analysis')
				setAnalysisResult(result.data.analysis)
				setShowAnalysis(true)
			} else {
				console.log('[JOB-POSTING-FORM] Job posting creation failed:', result.error)
				setErrors({ submit: result.error || 'Failed to create job posting' })
			}
		} catch (error) {
			console.error('[JOB-POSTING-FORM] Unexpected error during submission:', error)
			setErrors({ submit: 'An unexpected error occurred' })
		}
	}

	if (showAnalysis && analysisResult) {
		return (
			<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
				<div className="mb-6">
					<h2 className="mb-2 text-xl font-semibold text-black dark:text-white">
						Job Posted Successfully!
					</h2>
					<p className="text-gray-600 dark:text-gray-400">
						Your job posting has been created and analyzed by AI. Here's what we extracted:
					</p>
				</div>

				<AIExtractionResults analysis={analysisResult} />

				<div className="mt-6 flex gap-3">
					<button
						onClick={() => {
							setShowAnalysis(false)
							setAnalysisResult(null)
							setFormData({
								title: '',
								description: '',
								location: '',
								remoteAllowed: false,
								employmentType: 'full-time',
								experienceLevel: undefined,
								salaryMin: undefined,
								salaryMax: undefined,
								requiredSkills: [],
								preferredSkills: [],
							})
						}}
						className="bg-apple-blue font-system rounded-lg px-4 py-2 text-[17px] font-semibold text-white transition-all duration-150 ease-out hover:-translate-y-px hover:bg-[#0056CC] active:translate-y-0 active:bg-[#004499]"
					>
						Post Another Job
					</button>
					<button
						onClick={onCancel}
						className="font-system rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-[17px] font-semibold text-black transition-all duration-150 ease-out hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
					>
						Done
					</button>
				</div>
			</div>
		)
	}

	const handleJobImported = (jobData: JobImportData) => {
		// Extract skills from description using simple keyword matching
		const extractSkills = (description: string): string[] => {
			const commonSkills = [
				'JavaScript',
				'TypeScript',
				'Python',
				'Java',
				'C++',
				'C#',
				'Go',
				'Rust',
				'PHP',
				'Ruby',
				'React',
				'Vue',
				'Angular',
				'Node.js',
				'Express',
				'Django',
				'Flask',
				'Spring',
				'Laravel',
				'PostgreSQL',
				'MySQL',
				'MongoDB',
				'Redis',
				'AWS',
				'Azure',
				'GCP',
				'Docker',
				'Kubernetes',
				'Git',
				'Linux',
				'REST API',
				'GraphQL',
				'Microservices',
				'Agile',
				'Scrum',
			]

			const foundSkills: string[] = []
			const lowerDescription = description.toLowerCase()

			commonSkills.forEach((skill) => {
				const lowerSkill = skill.toLowerCase()
				if (lowerDescription.includes(lowerSkill)) {
					foundSkills.push(skill)
				}
			})

			return [...new Set(foundSkills)]
		}

		const extractedSkills = extractSkills(jobData.description)
		const requiredSkills = extractedSkills.slice(0, Math.ceil(extractedSkills.length * 0.7))
		const preferredSkills = extractedSkills.slice(requiredSkills.length)

		setFormData({
			title: jobData.title,
			description: jobData.description,
			location: jobData.location,
			remoteAllowed: jobData.location.toLowerCase().includes('remote'),
			employmentType: 'full-time',
			experienceLevel: undefined,
			salaryMin: undefined,
			salaryMax: undefined,
			requiredSkills,
			preferredSkills,
		})

		setShowImportForm(false)
	}

	if (showImportForm) {
		return (
			<JobImportForm
				onJobImported={handleJobImported}
				onCancel={() => setShowImportForm(false)}
			/>
		)
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black"
		>
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-xl font-semibold text-black dark:text-white">Post a New Job</h2>
				<button
					type="button"
					onClick={() => setShowImportForm(true)}
					className="font-system rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-[15px] font-medium text-black transition-all duration-150 ease-out hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
				>
					Import from URL
				</button>
			</div>

			{/* Job Title */}
			<div>
				<label
					htmlFor="title"
					className="mb-2 block text-[15px] font-medium text-black dark:text-white"
				>
					Job Title *
				</label>
				<input
					type="text"
					id="title"
					value={formData.title}
					onChange={(e) => handleInputChange('title', e.target.value)}
					className="font-system focus:border-apple-blue min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[17px] leading-tight text-black transition-colors duration-150 ease-out outline-none placeholder:text-gray-400 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white dark:placeholder:text-gray-500"
					placeholder="e.g. Senior Software Engineer"
					disabled={isLoading}
				/>
				{errors.title && <p className="text-apple-red mt-1 text-[13px]">{errors.title}</p>}
			</div>

			{/* Job Description */}
			<div>
				<label
					htmlFor="description"
					className="mb-2 block text-[15px] font-medium text-black dark:text-white"
				>
					Job Description *
				</label>
				<textarea
					id="description"
					value={formData.description}
					onChange={(e) => handleInputChange('description', e.target.value)}
					rows={8}
					className="font-system focus:border-apple-blue resize-vertical w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[17px] leading-tight text-black transition-colors duration-150 ease-out outline-none placeholder:text-gray-400 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white dark:placeholder:text-gray-500"
					placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity exciting..."
					disabled={isLoading}
				/>
				{errors.description && (
					<p className="text-apple-red mt-1 text-[13px]">{errors.description}</p>
				)}
				<p className="mt-1 text-[13px] text-gray-600 dark:text-gray-400">
					Our AI will analyze this description to extract skills, requirements, and other details
					automatically.
				</p>
			</div>

			{/* Location and Remote */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label
						htmlFor="location"
						className="mb-2 block text-[15px] font-medium text-black dark:text-white"
					>
						Location
					</label>
					<input
						type="text"
						id="location"
						value={formData.location}
						onChange={(e) => handleInputChange('location', e.target.value)}
						className="font-system focus:border-apple-blue min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[17px] leading-tight text-black transition-colors duration-150 ease-out outline-none placeholder:text-gray-400 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white dark:placeholder:text-gray-500"
						placeholder="e.g. San Francisco, CA"
						disabled={isLoading}
					/>
					{errors.location && <p className="text-apple-red mt-1 text-[13px]">{errors.location}</p>}
				</div>

				<div className="flex items-center">
					<label className="flex cursor-pointer items-center gap-3">
						<input
							type="checkbox"
							checked={formData.remoteAllowed}
							onChange={(e) => handleInputChange('remoteAllowed', e.target.checked)}
							className="text-apple-blue focus:ring-apple-blue h-5 w-5 rounded border border-gray-200 bg-white focus:ring-2 dark:border-gray-700 dark:bg-black"
							disabled={isLoading}
						/>
						<span className="text-[15px] text-black dark:text-white">Remote work allowed</span>
					</label>
				</div>
			</div>

			{/* Employment Type and Experience Level */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label
						htmlFor="employmentType"
						className="mb-2 block text-[15px] font-medium text-black dark:text-white"
					>
						Employment Type
					</label>
					<select
						id="employmentType"
						value={formData.employmentType}
						onChange={(e) => handleInputChange('employmentType', e.target.value as EmploymentType)}
						className="font-system focus:border-apple-blue min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[17px] leading-tight text-black transition-colors duration-150 ease-out outline-none focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white"
						disabled={isLoading}
					>
						<option value="full-time">Full-time</option>
						<option value="part-time">Part-time</option>
						<option value="contract">Contract</option>
						<option value="temporary">Temporary</option>
						<option value="internship">Internship</option>
					</select>
				</div>

				<div>
					<label
						htmlFor="experienceLevel"
						className="mb-2 block text-[15px] font-medium text-black dark:text-white"
					>
						Experience Level
					</label>
					<select
						id="experienceLevel"
						value={formData.experienceLevel || ''}
						onChange={(e) =>
							handleInputChange('experienceLevel', (e.target.value as ExperienceLevel) || undefined)
						}
						className="font-system focus:border-apple-blue min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[17px] leading-tight text-black transition-colors duration-150 ease-out outline-none focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white"
						disabled={isLoading}
					>
						<option value="">Let AI determine</option>
						<option value="entry">Entry Level</option>
						<option value="mid">Mid Level</option>
						<option value="senior">Senior Level</option>
						<option value="executive">Executive</option>
						<option value="intern">Intern</option>
					</select>
				</div>
			</div>

			{/* Salary Range */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label
						htmlFor="salaryMin"
						className="mb-2 block text-[15px] font-medium text-black dark:text-white"
					>
						Minimum Salary (USD)
					</label>
					<input
						type="number"
						id="salaryMin"
						value={formData.salaryMin || ''}
						onChange={(e) =>
							handleInputChange('salaryMin', e.target.value ? parseInt(e.target.value) : undefined)
						}
						className="font-system focus:border-apple-blue min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[17px] leading-tight text-black transition-colors duration-150 ease-out outline-none placeholder:text-gray-400 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white dark:placeholder:text-gray-500"
						placeholder="e.g. 80000"
						min="0"
						disabled={isLoading}
					/>
				</div>

				<div>
					<label
						htmlFor="salaryMax"
						className="mb-2 block text-[15px] font-medium text-black dark:text-white"
					>
						Maximum Salary (USD)
					</label>
					<input
						type="number"
						id="salaryMax"
						value={formData.salaryMax || ''}
						onChange={(e) =>
							handleInputChange('salaryMax', e.target.value ? parseInt(e.target.value) : undefined)
						}
						className="font-system focus:border-apple-blue min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[17px] leading-tight text-black transition-colors duration-150 ease-out outline-none placeholder:text-gray-400 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white dark:placeholder:text-gray-500"
						placeholder="e.g. 120000"
						min="0"
						disabled={isLoading}
					/>
					{errors.salaryMax && (
						<p className="text-apple-red mt-1 text-[13px]">{errors.salaryMax}</p>
					)}
				</div>
			</div>

			{/* Skills */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label
						htmlFor="requiredSkills"
						className="mb-2 block text-[15px] font-medium text-black dark:text-white"
					>
						Required Skills
					</label>
					<input
						type="text"
						id="requiredSkills"
						value={formData.requiredSkills?.join(', ') || ''}
						onChange={(e) => handleSkillsChange('requiredSkills', e.target.value)}
						className="font-system focus:border-apple-blue min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[17px] leading-tight text-black transition-colors duration-150 ease-out outline-none placeholder:text-gray-400 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white dark:placeholder:text-gray-500"
						placeholder="e.g. JavaScript, React, Node.js"
						disabled={isLoading}
					/>
					<p className="mt-1 text-[13px] text-gray-600 dark:text-gray-400">
						Separate skills with commas. Leave blank to let AI extract from description.
					</p>
					{errors.requiredSkills && (
						<p className="text-apple-red mt-1 text-[13px]">{errors.requiredSkills}</p>
					)}
				</div>

				<div>
					<label
						htmlFor="preferredSkills"
						className="mb-2 block text-[15px] font-medium text-black dark:text-white"
					>
						Preferred Skills
					</label>
					<input
						type="text"
						id="preferredSkills"
						value={formData.preferredSkills?.join(', ') || ''}
						onChange={(e) => handleSkillsChange('preferredSkills', e.target.value)}
						className="font-system focus:border-apple-blue min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[17px] leading-tight text-black transition-colors duration-150 ease-out outline-none placeholder:text-gray-400 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white dark:placeholder:text-gray-500"
						placeholder="e.g. TypeScript, GraphQL, AWS"
						disabled={isLoading}
					/>
					<p className="mt-1 text-[13px] text-gray-600 dark:text-gray-400">
						Nice-to-have skills that would be a bonus.
					</p>
					{errors.preferredSkills && (
						<p className="text-apple-red mt-1 text-[13px]">{errors.preferredSkills}</p>
					)}
				</div>
			</div>

			{/* Error Message */}
			{errors.submit && (
				<div className="border-apple-red bg-apple-red/10 text-apple-red rounded-lg border px-4 py-3">
					<p className="text-[15px]">{errors.submit}</p>
				</div>
			)}

			{/* Form Actions */}
			<div className="flex gap-3 pt-4">
				<button
					type="submit"
					disabled={isLoading}
					className="bg-apple-blue font-system disabled:hover:bg-apple-blue rounded-lg px-6 py-3 text-[17px] font-semibold text-white transition-all duration-150 ease-out hover:-translate-y-px hover:bg-[#0056CC] active:translate-y-0 active:bg-[#004499] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
				>
					{isLoading ? 'Creating Job...' : 'Create Job Posting'}
				</button>

				{onCancel && (
					<button
						type="button"
						onClick={onCancel}
						disabled={isLoading}
						className="font-system rounded-lg border border-gray-200 bg-gray-50 px-6 py-3 text-[17px] font-semibold text-black transition-all duration-150 ease-out hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
					>
						Cancel
					</button>
				)}
			</div>
		</form>
	)
}

// AI Extraction Results Component
interface AIExtractionResultsProps {
	analysis: JobAnalysisResult
}

function AIExtractionResults({ analysis }: AIExtractionResultsProps) {
	return (
		<div className="space-y-4">
			<div className="mb-4 flex items-center gap-2">
				<div className="bg-apple-green h-2 w-2 rounded-full"></div>
				<span className="text-[15px] text-gray-600 dark:text-gray-400">
					AI Analysis Confidence: {Math.round(analysis.confidence * 100)}%
				</span>
			</div>

			{analysis.summary && (
				<div>
					<h3 className="mb-2 text-[15px] font-medium text-black dark:text-white">Summary</h3>
					<p className="rounded-lg bg-gray-50 p-3 text-[15px] text-gray-600 dark:bg-gray-900 dark:text-gray-400">
						{analysis.summary}
					</p>
				</div>
			)}

			{analysis.requiredSkills.length > 0 && (
				<div>
					<h3 className="mb-2 text-[15px] font-medium text-black dark:text-white">
						Required Skills
					</h3>
					<div className="flex flex-wrap gap-2">
						{analysis.requiredSkills.map((skill, index) => (
							<span
								key={index}
								className="bg-apple-blue/10 text-apple-blue rounded-full px-3 py-1 text-[13px] font-medium"
							>
								{skill.name}
							</span>
						))}
					</div>
				</div>
			)}

			{analysis.preferredSkills.length > 0 && (
				<div>
					<h3 className="mb-2 text-[15px] font-medium text-black dark:text-white">
						Preferred Skills
					</h3>
					<div className="flex flex-wrap gap-2">
						{analysis.preferredSkills.map((skill, index) => (
							<span
								key={index}
								className="rounded-full bg-gray-100 px-3 py-1 text-[13px] font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
							>
								{skill.name}
							</span>
						))}
					</div>
				</div>
			)}

			{analysis.experienceLevel && (
				<div>
					<h3 className="mb-2 text-[15px] font-medium text-black dark:text-white">
						Experience Level
					</h3>
					<span className="bg-apple-green/10 text-apple-green rounded-full px-3 py-1 text-[13px] font-medium capitalize">
						{analysis.experienceLevel}
					</span>
				</div>
			)}

			{analysis.salaryRange && (analysis.salaryRange.min || analysis.salaryRange.max) && (
				<div>
					<h3 className="mb-2 text-[15px] font-medium text-black dark:text-white">Salary Range</h3>
					<p className="text-[15px] text-gray-600 dark:text-gray-400">
						{analysis.salaryRange.min && analysis.salaryRange.max
							? `$${analysis.salaryRange.min.toLocaleString()} - $${analysis.salaryRange.max.toLocaleString()}`
							: analysis.salaryRange.min
								? `From $${analysis.salaryRange.min.toLocaleString()}`
								: `Up to $${analysis.salaryRange.max?.toLocaleString()}`}
					</p>
				</div>
			)}

			{analysis.keyTerms.length > 0 && (
				<div>
					<h3 className="mb-2 text-[15px] font-medium text-black dark:text-white">Key Terms</h3>
					<div className="flex flex-wrap gap-2">
						{analysis.keyTerms.slice(0, 10).map((term, index) => (
							<span
								key={index}
								className="rounded bg-gray-100 px-2 py-1 text-[12px] text-gray-600 dark:bg-gray-800 dark:text-gray-400"
							>
								{term}
							</span>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
