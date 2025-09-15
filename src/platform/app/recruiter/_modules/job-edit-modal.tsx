'use client'

import { useState } from 'react'

import {
	JobAnalysisResult,
	JobPosting,
	UpdateJobPostingRequest,
} from '~/types/interview-management'

interface JobEditModalProps {
	job: JobPosting
	isOpen: boolean
	onClose: () => void
	onSave: (jobId: string, updates: UpdateJobPostingRequest) => Promise<void>
}

export function JobEditModal({ job, isOpen, onClose, onSave }: JobEditModalProps) {
	const [description, setDescription] = useState(job.rawDescription)
	const [title, setTitle] = useState(job.title)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	if (!isOpen) return null

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!description.trim()) {
			setError('Job description is required')
			return
		}

		if (description.trim().length < 50) {
			setError('Job description must be at least 50 characters long')
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			const updates: UpdateJobPostingRequest = {
				title: title.trim(),
				description: description.trim(),
			}

			await onSave(job.id, updates)
			onClose()
		} catch (err) {
			console.error('Error updating job posting:', err)
			setError(err instanceof Error ? err.message : 'Failed to update job posting')
		} finally {
			setIsLoading(false)
		}
	}

	const handleClose = () => {
		if (!isLoading) {
			setDescription(job.rawDescription)
			setTitle(job.title)
			setError(null)
			onClose()
		}
	}

	return (
		<div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
			<div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-black">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-gray-200 px-6 py-6 dark:border-gray-700">
					<h2 className="text-xl font-semibold text-black dark:text-white">Edit Job Posting</h2>
					<button
						onClick={handleClose}
						disabled={isLoading}
						className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-none text-gray-600 transition-all duration-150 ease-out hover:bg-gray-50 hover:text-black disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 hover:dark:bg-gray-900 hover:dark:text-white"
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

				{/* Content */}
				<div className="max-h-[calc(90vh-140px)] overflow-y-auto px-6 py-6">
					<form
						onSubmit={handleSubmit}
						className="space-y-6"
					>
						{/* AI Re-analysis Info */}
						<div className="bg-apple-blue/10 border-apple-blue/20 rounded-lg border p-4">
							<div className="flex items-start gap-3">
								<div className="mt-0.5 h-5 w-5 flex-shrink-0">
									<svg
										className="text-apple-blue h-5 w-5"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="flex-1">
									<h3 className="text-apple-blue mb-1 font-semibold">AI Re-analysis</h3>
									<p className="text-apple-blue/80 text-[15px]">
										When you update the job description, our AI will automatically re-analyze it to
										extract updated skills, requirements, and other details.
									</p>
								</div>
							</div>
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
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="font-system focus:border-apple-blue min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[17px] leading-tight text-black transition-colors duration-150 ease-out outline-none placeholder:text-gray-400 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white dark:placeholder:text-gray-500"
								placeholder="Enter job title"
								disabled={isLoading}
								required
							/>
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
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={20}
								className="font-system focus:border-apple-blue resize-vertical w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[15px] leading-relaxed text-black transition-colors duration-150 ease-out outline-none placeholder:text-gray-400 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white dark:placeholder:text-gray-500"
								placeholder="Enter the complete job description..."
								disabled={isLoading}
								required
							/>
							<div className="mt-2 flex items-center justify-between">
								<p className="text-[13px] text-gray-600 dark:text-gray-400">
									{description.length} characters{' '}
									{description.length < 50 && description.length > 0 && '(minimum 50 required)'}
								</p>
							</div>
						</div>

						{/* Error Message */}
						{error && (
							<div className="border-apple-red bg-apple-red/10 text-apple-red flex items-start gap-2 rounded-lg border px-4 py-3">
								<div className="mt-0.5 h-5 w-5 flex-shrink-0">
									<svg
										className="h-5 w-5"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="flex-1">
									<p className="text-[15px] font-medium">Error</p>
									<p className="text-[14px] opacity-90">{error}</p>
								</div>
							</div>
						)}

						{/* AI Processing Info */}
						{isLoading && (
							<div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
								<div className="flex items-center gap-3">
									<div className="border-apple-blue/30 border-t-apple-blue h-6 w-6 animate-spin rounded-full border-2"></div>
									<div className="flex-1">
										<p className="text-[15px] font-medium text-black dark:text-white">
											AI is re-analyzing your job posting...
										</p>
										<p className="mt-1 text-[13px] text-gray-600 dark:text-gray-400">
											This will update the extracted skills and requirements.
										</p>
									</div>
								</div>
							</div>
						)}
					</form>
				</div>

				{/* Footer */}
				<div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-6 dark:border-gray-700">
					<button
						type="button"
						onClick={handleClose}
						disabled={isLoading}
						className="px-6 py-3 text-gray-600 transition-colors duration-150 ease-out hover:text-black disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 hover:dark:text-white"
					>
						Cancel
					</button>
					<button
						onClick={handleSubmit}
						disabled={isLoading || !description.trim() || description.trim().length < 50}
						className="bg-apple-blue font-system disabled:hover:bg-apple-blue flex items-center gap-2 rounded-lg px-6 py-3 text-[17px] font-semibold text-white transition-all duration-150 ease-out hover:-translate-y-px hover:bg-[#0056CC] active:translate-y-0 active:bg-[#004499] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
					>
						{isLoading ? (
							<>
								<div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
								Updating...
							</>
						) : (
							<>
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
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
								Update & Re-analyze
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	)
}
