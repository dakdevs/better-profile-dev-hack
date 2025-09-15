'use client'

import React, { FC, FormEvent, useEffect, useRef, useState } from 'react'

import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { getBrowserCompatibility, logCompatibilityInfo } from '../utils/browserCompatibility'
import BraveCompatibilityFix from './BraveCompatibilityFix'
import ChatDebugTest from './ChatDebugTest'
import MicrophoneTest from './MicrophoneTest'
import VoiceDebugInfo from './VoiceDebugInfo'
import VoiceInputButton, { VoiceInputState } from './VoiceInputButton'

// --- TYPES & INTERFACES ---
interface Message {
	sender: 'user' | 'ai'
	text: string
}

interface IconProps {
	className?: string
}

// This is the expected shape of the data from our API
type ApiResponseData = {
	reply?: string
	message?: string // Used for errors
}

// --- SVG ICONS ---
const SendIcon: FC<IconProps> = ({ className }) => (
	<svg
		className={className}
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<line
			x1="22"
			y1="2"
			x2="11"
			y2="13"
		></line>
		<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
	</svg>
)

const BotIcon: FC<IconProps> = ({ className }) => (
	<svg
		className={className}
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M12 8V4H8" />
		<rect
			x="4"
			y="12"
			width="16"
			height="8"
			rx="2"
		/>
		<path d="M2 12h2" />
		<path d="M20 12h2" />
		<path d="M12 12v-2a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2" />
		<path d="M12 20v-4" />
		<path d="M8 20v-4" />
	</svg>
)

// --- UI SUB-COMPONENTS ---

// Component for a single message bubble
const MessageBubble: FC<{ message: Message }> = ({ message }) => {
	const isUser = message.sender === 'user'
	return (
		<div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
			{!isUser && (
				<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
					<BotIcon className="h-5 w-5 text-gray-500" />
				</div>
			)}
			<div
				className={`max-w-md rounded-2xl px-4 py-3 lg:max-w-2xl ${
					isUser
						? 'rounded-br-lg bg-blue-500 text-white'
						: 'rounded-bl-lg bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
				}`}
			>
				<p className="whitespace-pre-wrap">{message.text}</p>
			</div>
		</div>
	)
}

// --- MAIN CHAT COMPONENT ---
const SimpleChat: FC = () => {
	const [messages, setMessages] = useState<Message[]>([
		{
			sender: 'ai',
			text: "Congratulations, you are about to build a better profile! Let's get started- tell me about a recent project you worked on.",
		},
	])
	const [newMessage, setNewMessage] = useState<string>('')
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)

	// Voice input functionality
	const {
		isListening,
		transcript,
		interimTranscript,
		error: speechError,
		isSupported: isSpeechSupported,
		canRetry,
		permissionState,
		isProcessing,
		hasCompletedTranscription,
		startListening,
		stopListening,
		resetTranscript,
		retryListening,
	} = useSpeechRecognition()

	// Track the base message (user typed text) separately from speech transcript
	const [baseMessage, setBaseMessage] = useState<string>('')
	const [speechTranscript, setSpeechTranscript] = useState<string>('')

	// Browser compatibility information (initialize on client side only)
	const [browserInfo, setBrowserInfo] = useState(() => ({
		name: 'Unknown',
		version: 'unknown',
		isSupported: false,
		supportLevel: 'none' as const,
		recommendedBrowsers: ['Chrome', 'Edge', 'Safari'],
		limitations: [],
		guidance: '',
	}))

	// Update speech transcript when final results come in
	useEffect(() => {
		if (transcript) {
			setSpeechTranscript((prev) => prev + (prev ? ' ' : '') + transcript)
			resetTranscript() // Clear the transcript after adding to speech transcript
		}
	}, [transcript, resetTranscript])

	// Combine base message with speech transcript for display
	useEffect(() => {
		const combinedMessage =
			baseMessage + (speechTranscript ? (baseMessage ? ' ' : '') + speechTranscript : '')
		setNewMessage(combinedMessage)
	}, [baseMessage, speechTranscript])

	// Determine voice button state
	const getVoiceButtonState = (): VoiceInputState => {
		if (speechError) return 'error'
		if (hasCompletedTranscription) return 'completed'
		if (isProcessing) return 'processing'
		if (isListening) return 'listening'
		return 'idle'
	}

	// Handle voice button click
	const handleVoiceButtonClick = () => {
		if (isListening) {
			stopListening()
		} else {
			// Reset speech transcript when starting new recording
			setSpeechTranscript('')
			startListening()
		}
	}

	// Handle retry functionality
	const handleVoiceRetry = () => {
		setSpeechTranscript('')
		retryListening()
	}

	// Function to scroll to the latest message
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	// Initialize browser compatibility information on client side
	useEffect(() => {
		// Only run on client side
		if (typeof window !== 'undefined') {
			setBrowserInfo(getBrowserCompatibility())

			if (process.env.NODE_ENV === 'development') {
				logCompatibilityInfo()
			}
		}
	}, [])

	// Function to handle form submission
	const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const userMessage = newMessage.trim()
		if (userMessage === '' || isLoading) return

		setMessages((prev) => [...prev, { sender: 'user', text: userMessage }])
		setNewMessage('')
		setBaseMessage('')
		setSpeechTranscript('')
		setIsLoading(true)

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					messages: [
						...messages.map((msg) => ({
							role: msg.sender === 'user' ? 'user' : 'assistant',
							content: msg.text,
						})),
						{ role: 'user', content: userMessage },
					],
				}),
			})

			if (!response.ok) {
				throw new Error(`API error: ${response.statusText}`)
			}

			const data: ApiResponseData = await response.json()
			console.log('API response:', data)
			console.log('API reply:', data.reply)

			if (data.reply) {
				//debuggging
				console.log('API data:', data)
				console.log('API reply:', data.reply)

				setMessages((prev) => [...prev, { sender: 'ai', text: data.reply as string }])
			} else {
				throw new Error('Invalid response from server')
			}
		} catch (error) {
			console.error('Failed to send message:', error)
			setMessages((prev) => [
				...prev,
				{ sender: 'ai', text: "Sorry, I'm having trouble connecting. Please try again later." },
			])
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="flex h-screen w-full flex-col bg-white font-sans dark:bg-gray-900">
			<BraveCompatibilityFix />
			<VoiceDebugInfo />
			<ChatDebugTest />
			<MicrophoneTest />
			<header className="flex items-center border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
				<BotIcon className="h-6 w-6 text-blue-500" />
				<h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
			</header>

			<main className="flex-1 space-y-6 overflow-y-auto bg-gray-50 p-6 dark:bg-gray-800">
				{messages.map((msg, index) => (
					<MessageBubble
						key={index}
						message={msg}
					/>
				))}
				{isLoading && (
					<div className="flex items-start justify-start gap-3">
						<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
							<BotIcon className="h-5 w-5 text-gray-500" />
						</div>
						<div className="rounded-2xl bg-gray-200 px-4 py-3 dark:bg-gray-700">
							<div className="flex items-center justify-center space-x-1">
								<span className="h-2 w-2 animate-pulse rounded-full bg-gray-500 [animation-delay:-0.3s]"></span>
								<span className="h-2 w-2 animate-pulse rounded-full bg-gray-500 [animation-delay:-0.15s]"></span>
								<span className="h-2 w-2 animate-pulse rounded-full bg-gray-500"></span>
							</div>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</main>

			<footer className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
				<form
					onSubmit={handleSendMessage}
					className="flex items-center space-x-4"
				>
					<div className="relative flex-1">
						<div className="relative">
							<input
								type="text"
								value={newMessage}
								onChange={(e) => {
									const value = e.target.value
									setNewMessage(value)
									// Update base message by removing any speech transcript
									if (speechTranscript) {
										const speechPart = (baseMessage ? ' ' : '') + speechTranscript
										if (value.endsWith(speechPart)) {
											setBaseMessage(value.slice(0, -speechPart.length))
										} else {
											// User is editing, reset speech transcript
											setSpeechTranscript('')
											setBaseMessage(value)
										}
									} else {
										setBaseMessage(value)
									}
								}}
								placeholder="Type a message to the AI..."
								className="w-full rounded-full border border-transparent bg-gray-100 px-6 py-3 pr-14 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-gray-200"
								disabled={isLoading}
							/>
							{/* Interim transcript overlay for visual indication */}
							{interimTranscript && (
								<div className="pointer-events-none absolute inset-0 flex items-center px-6 py-3 pr-14">
									<span className="invisible">{newMessage}</span>
									<span className="text-gray-400 italic dark:text-gray-500">
										{newMessage ? ' ' : ''}
										{interimTranscript}
									</span>
								</div>
							)}

							{/* Processing indicator overlay */}
							{isProcessing && (
								<div className="pointer-events-none absolute inset-0 flex items-center justify-end px-6 py-3 pr-14">
									<div className="flex items-center space-x-2 text-sm text-blue-500">
										<div className="flex space-x-1">
											<div className="h-1 w-1 animate-pulse rounded-full bg-blue-500 [animation-delay:-0.3s]"></div>
											<div className="h-1 w-1 animate-pulse rounded-full bg-blue-500 [animation-delay:-0.15s]"></div>
											<div className="h-1 w-1 animate-pulse rounded-full bg-blue-500"></div>
										</div>
										<span className="text-xs">Processing...</span>
									</div>
								</div>
							)}

							{/* Completion confirmation overlay */}
							{hasCompletedTranscription && !isProcessing && (
								<div className="pointer-events-none absolute inset-0 flex items-center justify-end px-6 py-3 pr-14">
									<div className="animate-fade-in flex items-center space-x-2 text-sm text-green-500">
										<svg
											className="h-4 w-4"
											fill="currentColor"
											viewBox="0 0 20 20"
										>
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
										<span className="text-xs">Transcribed!</span>
									</div>
								</div>
							)}
						</div>
						{/* Voice input button positioned inside the input field */}
						<div className="absolute top-1/2 right-2 -translate-y-1/2 transform">
							<VoiceInputButton
								state={getVoiceButtonState()}
								onClick={handleVoiceButtonClick}
								onRetry={handleVoiceRetry}
								disabled={isLoading || !browserInfo.isSupported}
								error={speechError || undefined}
								canRetry={canRetry}
								permissionState={permissionState}
								isSupported={browserInfo.isSupported}
								browserInfo={browserInfo}
								className="!p-2"
							/>
						</div>
					</div>
					<button
						type="submit"
						className="flex-shrink-0 rounded-full bg-blue-500 p-3 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
						disabled={!newMessage.trim() || isLoading}
					>
						<SendIcon className="h-6 w-6" />
					</button>
				</form>
			</footer>
		</div>
	)
}

export default SimpleChat
