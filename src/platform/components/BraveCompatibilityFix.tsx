/**
 * Brave Browser Compatibility Fix Component
 * Shows specific instructions for Brave browser users
 */

'use client'

import React, { useEffect, useState } from 'react'

import { detectBrowser } from '../utils/browserCompatibility'

const BraveCompatibilityFix: React.FC = () => {
	const [showBraveInstructions, setShowBraveInstructions] = useState(false)
	const [isDismissed, setIsDismissed] = useState(false)

	useEffect(() => {
		// Only run on client side
		if (typeof window === 'undefined') return

		const browser = detectBrowser()
		const isBrave =
			browser.name === 'Brave'
			|| (browser.name === 'Chrome' && (navigator as any).brave && (navigator as any).brave.isBrave)

		// Also show if we detect Chrome but it might be Brave (common case)
		const mightBeBrave = browser.name === 'Chrome' && navigator.userAgent.includes('Chrome')

		if ((isBrave || mightBeBrave) && !isDismissed) {
			setShowBraveInstructions(true)
		}
	}, [isDismissed])

	if (!showBraveInstructions || isDismissed) {
		return null
	}

	return (
		<div className="fixed top-4 right-4 left-4 z-50 mx-auto max-w-2xl">
			<div className="rounded-lg border border-orange-200 bg-orange-50 p-4 shadow-lg">
				<div className="flex items-start">
					<div className="flex-shrink-0">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
							🦁
						</div>
					</div>
					<div className="ml-3 flex-1">
						<h3 className="text-sm font-medium text-orange-800">
							🚨 Brave Browser - Fix "Network Error" for Voice Input
						</h3>
						<div className="mt-2 text-sm text-orange-700">
							<p className="mb-2">To enable voice input in Brave browser:</p>
							<ol className="list-inside list-decimal space-y-1 text-xs">
								<li>
									Click the <strong>Brave Shields icon</strong> (🦁) in the address bar
								</li>
								<li>
									Set <strong>"Block fingerprinting"</strong> to{' '}
									<strong>"Allow all fingerprinting"</strong>
								</li>
								<li>
									Set <strong>"Block scripts"</strong> to <strong>"Allow all scripts"</strong>
								</li>
								<li>Refresh this page</li>
								<li>
									When prompted, <strong>allow microphone access</strong>
								</li>
							</ol>
							<p className="mt-2 text-xs">
								<strong>Alternative:</strong> Go to <code>brave://settings/content/microphone</code>{' '}
								and add this site to allowed sites.
							</p>
						</div>
						<div className="mt-3 flex flex-wrap gap-2">
							<button
								onClick={() => {
									// Open Brave settings in new tab
									window.open('brave://settings/content/microphone', '_blank')
								}}
								className="rounded bg-orange-600 px-3 py-1 text-xs text-white transition-colors hover:bg-orange-700"
							>
								🔧 Open Brave Settings
							</button>
							<button
								onClick={() => window.location.reload()}
								className="rounded bg-green-600 px-3 py-1 text-xs text-white transition-colors hover:bg-green-700"
							>
								🔄 Refresh Page
							</button>
							<button
								onClick={() => setIsDismissed(true)}
								className="rounded bg-gray-500 px-3 py-1 text-xs text-white transition-colors hover:bg-gray-600"
							>
								✕ Dismiss
							</button>
						</div>
					</div>
					<button
						onClick={() => setIsDismissed(true)}
						className="ml-2 flex-shrink-0 text-orange-400 hover:text-orange-600"
					>
						<span className="sr-only">Close</span>
						<svg
							className="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
								clipRule="evenodd"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	)
}

export default BraveCompatibilityFix
