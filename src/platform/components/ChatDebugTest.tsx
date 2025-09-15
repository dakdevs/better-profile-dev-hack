/**
 * Chat Debug Test Component
 * Simple test to verify API connectivity
 */

'use client'

import React, { useState } from 'react'

const ChatDebugTest: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [result, setResult] = useState<string>('')
	const [error, setError] = useState<string>('')

	const testAPI = async () => {
		setIsLoading(true)
		setResult('')
		setError('')

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messages: [{ role: 'user', content: 'Hello, this is a test message' }],
				}),
			})

			const data = await response.json()

			if (response.ok) {
				setResult(`✅ Success! AI Response: "${data.reply}"`)
			} else {
				setError(`❌ API Error: ${data.reply || 'Unknown error'}`)
			}
		} catch (err: any) {
			setError(`❌ Network Error: ${err.message}`)
		} finally {
			setIsLoading(false)
		}
	}

	const testEnvironment = () => {
		const env = {
			hasAPIKey: !!process.env.NEXT_PUBLIC_TEST || 'API key should be server-side',
			protocol: window.location.protocol,
			hostname: window.location.hostname,
			port: window.location.port,
			userAgent: navigator.userAgent.substring(0, 100) + '...',
		}

		setResult(`🔍 Environment Info:
Protocol: ${env.protocol}
Hostname: ${env.hostname}
Port: ${env.port}
User Agent: ${env.userAgent}
API Key: ${env.hasAPIKey}`)
	}

	if (!isOpen) {
		return (
			<div className="fixed right-4 bottom-16 z-50">
				<button
					onClick={() => setIsOpen(true)}
					className="rounded-full bg-green-500 px-3 py-2 text-sm font-medium text-white shadow-lg transition-colors hover:bg-green-600"
				>
					🧪 Chat Test
				</button>
			</div>
		)
	}

	return (
		<div className="fixed right-4 bottom-16 z-50">
			<div className="max-h-96 w-80 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<h3 className="font-semibold text-gray-900 dark:text-white">Chat API Test</h3>
						<button
							onClick={() => setIsOpen(false)}
							className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
						>
							✕
						</button>
					</div>

					<div className="space-y-2">
						<button
							onClick={testAPI}
							disabled={isLoading}
							className="w-full rounded bg-blue-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:bg-blue-300"
						>
							{isLoading ? '🔄 Testing...' : '🚀 Test Chat API'}
						</button>

						<button
							onClick={testEnvironment}
							className="w-full rounded bg-gray-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-600"
						>
							🔍 Check Environment
						</button>
					</div>

					{(result || error) && (
						<div className="border-t border-gray-200 pt-2 dark:border-gray-700">
							<div className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
								Result:
							</div>
							<div
								className={`rounded p-2 text-xs ${
									error
										? 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300'
										: 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300'
								}`}
							>
								<pre className="whitespace-pre-wrap">{result || error}</pre>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default ChatDebugTest
