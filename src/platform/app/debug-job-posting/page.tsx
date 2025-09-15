'use client'

import { useState } from 'react'

import { useCSRFToken } from '~/hooks/use-csrf-token'

export default function DebugJobPostingPage() {
	const [result, setResult] = useState<any>(null)
	const [loading, setLoading] = useState(false)
	const { token: csrfToken, isLoading: csrfLoading } = useCSRFToken()

	const testJobPosting = async () => {
		if (!csrfToken) {
			setResult({ error: 'CSRF token not available' })
			return
		}

		setLoading(true)
		setResult(null)

		try {
			const testData = {
				title: 'Test Software Engineer',
				description: 'We are looking for a software engineer with JavaScript and React experience.',
				location: 'San Francisco, CA',
				requiredSkills: ['JavaScript', 'React'],
				preferredSkills: ['TypeScript'],
				experienceLevel: 'mid',
				employmentType: 'full-time',
				remoteAllowed: true,
				salaryMin: 100000,
				salaryMax: 150000,
			}

			console.log('Making API call with data:', testData)
			console.log('CSRF token:', csrfToken)

			const response = await fetch('/api/recruiter/jobs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-csrf-token': csrfToken,
				},
				body: JSON.stringify(testData),
			})

			console.log('Response status:', response.status)
			console.log('Response headers:', Object.fromEntries(response.headers.entries()))

			const responseText = await response.text()
			console.log('Response text:', responseText)

			let responseData
			try {
				responseData = JSON.parse(responseText)
			} catch (parseError) {
				responseData = { error: 'Invalid JSON response', responseText }
			}

			setResult({
				status: response.status,
				ok: response.ok,
				data: responseData,
				headers: Object.fromEntries(response.headers.entries()),
			})
		} catch (error) {
			console.error('Error testing job posting:', error)
			setResult({
				error: error instanceof Error ? error.message : 'Unknown error',
				stack: error instanceof Error ? error.stack : undefined,
			})
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="mx-auto max-w-4xl p-8">
			<h1 className="mb-6 text-2xl font-bold">Debug Job Posting</h1>

			<div className="space-y-4">
				<div className="rounded bg-gray-100 p-4">
					<h2 className="mb-2 font-semibold">CSRF Status</h2>
					<p>Loading: {csrfLoading ? 'Yes' : 'No'}</p>
					<p>Token: {csrfToken ? 'Available' : 'Not available'}</p>
					{csrfToken && (
						<p className="mt-1 text-xs text-gray-600">Token: {csrfToken.substring(0, 10)}...</p>
					)}
				</div>

				<button
					onClick={testJobPosting}
					disabled={loading || csrfLoading || !csrfToken}
					className="rounded bg-blue-500 px-4 py-2 text-white disabled:bg-gray-400"
				>
					{loading ? 'Testing...' : 'Test Job Posting API'}
				</button>

				{result && (
					<div className="rounded bg-gray-100 p-4">
						<h2 className="mb-2 font-semibold">API Response</h2>
						<pre className="max-h-96 overflow-auto rounded bg-white p-2 text-xs">
							{JSON.stringify(result, null, 2)}
						</pre>
					</div>
				)}
			</div>
		</div>
	)
}
