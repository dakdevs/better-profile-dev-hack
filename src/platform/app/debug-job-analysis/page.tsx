'use client'

import { useState } from 'react'

export default function DebugJobAnalysisPage() {
	const [result, setResult] = useState<any>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const testJobPosting = async () => {
		setLoading(true)
		setError(null)
		setResult(null)

		try {
			const testJobData = {
				title: 'Senior Software Engineer',
				description: `We are looking for a Senior Software Engineer to join our team.

Requirements:
- 5+ years of experience with JavaScript and React
- Experience with Node.js and PostgreSQL
- Strong problem-solving skills
- Bachelor's degree in Computer Science

Nice to have:
- Experience with TypeScript
- Knowledge of AWS
- Docker experience

Salary: $120,000 - $160,000
Location: San Francisco, CA (Remote OK)
Type: Full-time`,
				remoteAllowed: true,
				employmentType: 'full-time',
			}

			console.log('Testing job posting with data:', testJobData)

			const response = await fetch('/api/recruiter/jobs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(testJobData),
			})

			console.log('Response status:', response.status)
			console.log('Response headers:', Object.fromEntries(response.headers.entries()))

			const responseText = await response.text()
			console.log('Raw response:', responseText)

			let data
			try {
				data = JSON.parse(responseText)
			} catch (parseError) {
				throw new Error(`Failed to parse response as JSON: ${responseText}`)
			}

			console.log('Parsed response:', data)
			setResult(data)
		} catch (err) {
			console.error('Test error:', err)
			setError(err instanceof Error ? err.message : String(err))
		} finally {
			setLoading(false)
		}
	}

	const testAIAnalysisDirectly = async () => {
		setLoading(true)
		setError(null)
		setResult(null)

		try {
			// Test the AI analysis service directly
			const response = await fetch('/api/debug/ai-analysis', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					description: `We are looking for a Senior Software Engineer to join our team.

Requirements:
- 5+ years of experience with JavaScript and React
- Experience with Node.js and PostgreSQL
- Strong problem-solving skills

Salary: $120,000 - $160,000`,
					title: 'Senior Software Engineer',
				}),
			})

			const data = await response.json()
			console.log('AI Analysis result:', data)
			setResult(data)
		} catch (err) {
			console.error('AI Analysis test error:', err)
			setError(err instanceof Error ? err.message : String(err))
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="mx-auto max-w-4xl p-6">
			<h1 className="mb-6 text-2xl font-bold">Debug Job Analysis</h1>

			<div className="mb-6 space-y-4">
				<button
					onClick={testJobPosting}
					disabled={loading}
					className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
				>
					{loading ? 'Testing...' : 'Test Full Job Posting Flow'}
				</button>

				<button
					onClick={testAIAnalysisDirectly}
					disabled={loading}
					className="ml-4 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
				>
					{loading ? 'Testing...' : 'Test AI Analysis Only'}
				</button>
			</div>

			{error && (
				<div className="mb-4 rounded border border-red-200 bg-red-50 p-4">
					<h3 className="font-semibold text-red-800">Error:</h3>
					<pre className="mt-2 text-sm whitespace-pre-wrap text-red-700">{error}</pre>
				</div>
			)}

			{result && (
				<div className="rounded border border-gray-200 bg-gray-50 p-4">
					<h3 className="mb-2 font-semibold">Result:</h3>
					<pre className="max-h-96 overflow-auto text-sm whitespace-pre-wrap">
						{JSON.stringify(result, null, 2)}
					</pre>
				</div>
			)}
		</div>
	)
}
