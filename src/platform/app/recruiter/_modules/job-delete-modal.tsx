'use client'

import { useState } from 'react'

import { JobPosting } from '~/types/interview-management'

interface JobDeleteModalProps {
	job: JobPosting | null
	isOpen: boolean
	onClose: () => void
	onConfirm: (jobId: string) => Promise<void>
}

export function JobDeleteModal({ job, isOpen, onClose, onConfirm }: JobDeleteModalProps) {
	const [isDeleting, setIsDeleting] = useState(false)
	const [error, setError] = useState<string | null>(null)

	if (!isOpen || !job) return null

	const handleConfirm = async () => {
		setIsDeleting(true)
		setError(null)

		try {
			await onConfirm(job.id)
			onClose()
		} catch (err) {
			console.error('Error deleting job posting:', err)
			setError(err instanceof Error ? err.message : 'Failed to delete job posting')
		} finally {
			setIsDeleting(false)
		}
	}

	const handleClose = () => {
		if (!isDeleting) {
			setError(null)
			onClose()
		}
	}

	return (
		<div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
			<div className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-black">
				{/* Header */}
				<div className="border-b border-gray-200 px-6 py-6 dark:border-gray-700">
					<div className="flex items-center gap-4">
						<div className="bg-apple-red/10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full">
							<svg
								className="text-apple-red h-6 w-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
						</div>
						<div className="flex-1">
							<h2 className="text-xl font-semibold text-black dark:text-white">
								Delete Job Posting
							</h2>
							<p className="mt-1 text-[15px] text-gray-600 dark:text-gray-400">
								This action cannot be undone
							</p>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="px-6 py-6">
					<p className="mb-4 text-[15px] text-gray-600 dark:text-gray-400">
						Are you sure you want to delete the job posting{' '}
						<strong className="text-black dark:text-white">"{job.title}"</strong>?
					</p>

					<div className="bg-apple-red/10 border-apple-red/20 mb-4 rounded-lg border p-4">
						<div className="flex items-start gap-3">
							<div className="mt-0.5 h-5 w-5 flex-shrink-0">
								<svg
									className="text-apple-red h-5 w-5"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="flex-1">
								<p className="text-apple-red mb-1 text-[15px] font-medium">
									This will permanently delete:
								</p>
								<ul className="text-apple-red/80 space-y-1 text-[13px]">
									<li>• The job posting and all its details</li>
									<li>• Any scheduled interviews for this position</li>
									<li>• Candidate matches and applications</li>
									<li>• All related notifications and data</li>
								</ul>
							</div>
						</div>
					</div>

					{/* Error Message */}
					{error && (
						<div className="border-apple-red bg-apple-red/10 text-apple-red mb-4 flex items-start gap-2 rounded-lg border px-4 py-3">
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

					{/* Deleting Status */}
					{isDeleting && (
						<div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
							<div className="flex items-center gap-3">
								<div className="border-apple-red/30 border-t-apple-red h-6 w-6 animate-spin rounded-full border-2"></div>
								<div className="flex-1">
									<p className="text-[15px] font-medium text-black dark:text-white">
										Deleting job posting...
									</p>
									<p className="mt-1 text-[13px] text-gray-600 dark:text-gray-400">
										Please wait while we remove all related data.
									</p>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-6 dark:border-gray-700">
					<button
						type="button"
						onClick={handleClose}
						disabled={isDeleting}
						className="font-system rounded-lg border border-gray-200 bg-gray-50 px-6 py-3 text-[17px] font-semibold text-black transition-all duration-150 ease-out hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
					>
						Cancel
					</button>
					<button
						onClick={handleConfirm}
						disabled={isDeleting}
						className="bg-apple-red font-system disabled:hover:bg-apple-red flex items-center gap-2 rounded-lg px-6 py-3 text-[17px] font-semibold text-white transition-all duration-150 ease-out hover:-translate-y-px hover:bg-red-600 active:translate-y-0 active:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
					>
						{isDeleting ? (
							<>
								<div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
								Deleting...
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
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
								Delete Job Posting
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	)
}
