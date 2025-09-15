'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle, Eye, Loader2, Plus, User } from 'lucide-react'

interface CandidateSkillImporterProps {
	onSkillsImported?: () => void
}

export function CandidateSkillImporter({ onSkillsImported }: CandidateSkillImporterProps) {
	const [loading, setLoading] = useState(false)
	const [checking, setChecking] = useState(false)
	const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
	const [message, setMessage] = useState('')
	const [skillsData, setSkillsData] = useState<any>(null)

	const handleCheckSkills = async () => {
		setChecking(true)
		setStatus('idle')
		setMessage('')

		try {
			const response = await fetch('/api/debug/candidate-skills')
			const data = await response.json()

			if (data.success) {
				setSkillsData(data)
				setMessage(`Found ${data.skillCount} skills in your profile`)
				setStatus(data.skillCount > 0 ? 'success' : 'error')
			} else {
				setStatus('error')
				setMessage(data.error || 'Failed to check skills')
			}
		} catch (error) {
			console.error('Error checking skills:', error)
			setStatus('error')
			setMessage('Network error. Please try again.')
		} finally {
			setChecking(false)
		}
	}

	const handleAddTestSkills = async () => {
		setLoading(true)
		setStatus('idle')
		setMessage('')

		try {
			const response = await fetch('/api/debug/add-test-skills', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			})

			const data = await response.json()

			if (data.success) {
				setStatus('success')
				setMessage(`Added ${data.skillsAdded} test skills to your profile`)
				// Refresh skills data and notify parent
				setTimeout(() => {
					handleCheckSkills()
					onSkillsImported?.()
				}, 1000)
			} else {
				setStatus('error')
				setMessage(data.error || 'Failed to add test skills')
			}
		} catch (error) {
			console.error('Error adding test skills:', error)
			setStatus('error')
			setMessage('Network error. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	const getButtonContent = (isLoading: boolean, defaultText: string, loadingText: string) => {
		if (isLoading) {
			return (
				<>
					<Loader2 className="h-4 w-4 animate-spin" />
					{loadingText}
				</>
			)
		}
		return defaultText
	}

	return (
		<div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
			<div className="flex items-start gap-4">
				<div className="rounded-lg bg-blue-100 p-2">
					<User className="h-6 w-6 text-blue-600" />
				</div>
				<div className="flex-1">
					<h3 className="mb-2 font-semibold text-blue-900">Candidate Skills Debug</h3>
					<p className="mb-4 text-sm text-blue-800">
						To see job matches, you need skills in your profile from AI interviews. Use the tools
						below to check your current skills or add test skills for demonstration.
					</p>

					<div className="mb-4 flex flex-wrap gap-3">
						<button
							onClick={handleCheckSkills}
							disabled={checking}
							className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Eye className="h-4 w-4" />
							{getButtonContent(checking, 'Check My Skills', 'Checking...')}
						</button>

						<button
							onClick={handleAddTestSkills}
							disabled={loading}
							className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Plus className="h-4 w-4" />
							{getButtonContent(loading, 'Add Test Skills', 'Adding...')}
						</button>
					</div>

					{message && (
						<div
							className={`mb-3 flex items-center gap-2 text-sm ${
								status === 'success' ? 'text-green-700' : 'text-red-700'
							}`}
						>
							{status === 'success' ? (
								<CheckCircle className="h-4 w-4" />
							) : (
								<AlertCircle className="h-4 w-4" />
							)}
							{message}
						</div>
					)}

					{skillsData && (
						<div className="rounded-lg border border-blue-200 bg-white p-4">
							<h4 className="mb-2 font-medium text-gray-900">Your Skills Profile</h4>
							<div className="mb-3 text-sm text-gray-600">
								<p>
									<strong>Candidate ID:</strong> {skillsData.candidateId}
								</p>
								<p>
									<strong>Skills Count:</strong> {skillsData.skillCount}
								</p>
							</div>

							{skillsData.skills && skillsData.skills.length > 0 && (
								<div>
									<p className="mb-2 text-sm font-medium text-gray-700">Current Skills:</p>
									<div className="flex flex-wrap gap-2">
										{skillsData.skills.slice(0, 10).map((skill: any, index: number) => (
											<span
												key={index}
												className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
											>
												{skill.skillName} ({skill.proficiencyScore})
											</span>
										))}
										{skillsData.skills.length > 10 && (
											<span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
												+{skillsData.skills.length - 10} more
											</span>
										)}
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
