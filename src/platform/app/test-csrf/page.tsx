'use client'

import { useState } from 'react'

import { secureApiRequest, useCSRFToken } from '~/hooks/use-csrf-token'

export default function TestCSRFPage() {
	const [result, setResult] = useState<string>('')
	const [loading, setLoading] = useState(false)

	const csrfToken = useCSRFToken()

	const testJobPosting = async () => {
		setLoading(true)
		setResult('')

		try {
			const testJobData = {
				title: 'Test Job',
				description:
					'This is a test job posting to verify CSRF token functionality. It should work now with proper CSRF protection.',
				location: 'Remote',
				remoteAllowed: true,
				employmentType: 'full-time' as const,
			}

			const response = await secureApiRequest('/api/recruiter/jobs', {
				method: 'POST',
				body: JSON.stringify(testJobData),
			})

			const data = await response.json()

			if (data.success) {
				setResult('✅ Success! Job posting created with CSRF protection.')
			} else {
				setResult(`❌ Error: ${data.error}`)
			}
		} catch (error) {
			setResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="mx-auto max-w-2xl p-6">
			<h1 className="mb-4 text-2xl font-semibold">CSRF Token Test</h1>

			<div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
				<div>
					<p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Current CSRF Token:</p>
					<code className="block rounded bg-gray-100 p-2 text-xs break-all dark:bg-gray-800">
						{csrfToken || 'Loading...'}
					</code>
				</div>

				<button
					onClick={testJobPosting}
					disabled={loading || !csrfToken}
					className="bg-apple-blue w-full rounded-lg px-4 py-3 font-semibold text-white transition-all duration-150 ease-out hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{loading ? 'Testing...' : 'Test Job Posting API with CSRF'}
				</button>

				{result && (
					<div
						className={`rounded-lg p-4 ${
							result.includes('✅')
								? 'border border-green-200 bg-green-50 text-green-800'
								: 'border border-red-200 bg-red-50 text-red-800'
						}`}
					>
						{result}
					</div>
				)}
			</div>
		</div>
	)
}
