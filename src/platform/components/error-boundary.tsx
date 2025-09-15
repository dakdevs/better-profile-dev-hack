'use client'

import React from 'react'

interface ErrorBoundaryState {
	hasError: boolean
	error?: Error
}

interface ErrorBoundaryProps {
	children: React.ReactNode
	fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
	onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props)
		this.state = { hasError: false }
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('ErrorBoundary caught an error:', error, errorInfo)
		this.props.onError?.(error, errorInfo)
	}

	resetError = () => {
		this.setState({ hasError: false, error: undefined })
	}

	render() {
		if (this.state.hasError) {
			const FallbackComponent = this.props.fallback || DefaultErrorFallback
			return (
				<FallbackComponent
					error={this.state.error}
					resetError={this.resetError}
				/>
			)
		}

		return this.props.children
	}
}

interface ErrorFallbackProps {
	error?: Error
	resetError: () => void
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
	return (
		<div className="flex min-h-[200px] items-center justify-center p-6">
			<div className="max-w-md text-center">
				<div className="bg-apple-red/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
					<svg
						className="text-apple-red h-8 w-8"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
						/>
					</svg>
				</div>
				<h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
					Something went wrong
				</h3>
				<p className="mb-4 text-gray-600 dark:text-gray-400">
					{error?.message || 'An unexpected error occurred. Please try again.'}
				</p>
				<button
					onClick={resetError}
					className="bg-apple-blue font-system focus-visible:outline-apple-blue inline-flex min-h-[44px] items-center justify-center rounded-lg px-4 py-3 text-[17px] font-semibold text-white transition-all duration-150 ease-out hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2"
				>
					Try again
				</button>
			</div>
		</div>
	)
}

// Specific error fallbacks for different components
export function InterviewErrorFallback({ error, resetError }: ErrorFallbackProps) {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
			<div className="text-center">
				<div className="bg-apple-red/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
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
							d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</div>
				<h3 className="mb-2 text-base font-semibold text-black dark:text-white">
					Interview system error
				</h3>
				<p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
					Unable to load interview information. Please refresh the page or try again later.
				</p>
				<button
					onClick={resetError}
					className="bg-apple-blue inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-600"
				>
					Retry
				</button>
			</div>
		</div>
	)
}

export function JobPostingErrorFallback({ error, resetError }: ErrorFallbackProps) {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
			<div className="text-center">
				<div className="bg-apple-red/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
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
							d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z"
						/>
					</svg>
				</div>
				<h3 className="mb-2 text-base font-semibold text-black dark:text-white">
					Job posting error
				</h3>
				<p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
					Unable to load job posting information. Please check your connection and try again.
				</p>
				<button
					onClick={resetError}
					className="bg-apple-blue inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-600"
				>
					Retry
				</button>
			</div>
		</div>
	)
}

export function AvailabilityErrorFallback({ error, resetError }: ErrorFallbackProps) {
	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
			<div className="text-center">
				<div className="bg-apple-red/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
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
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h3 className="mb-2 text-base font-semibold text-black dark:text-white">
					Availability system error
				</h3>
				<p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
					Unable to load availability information. Your schedule data is safe.
				</p>
				<button
					onClick={resetError}
					className="bg-apple-blue inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-600"
				>
					Retry
				</button>
			</div>
		</div>
	)
}
