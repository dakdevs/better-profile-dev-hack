'use client'

import { useState } from 'react'

import { useInterviewRAG } from '~/hooks/use-interview-rag'

interface Message {
	role: 'user' | 'assistant'
	content: string
}

export function InterviewChatWithRAG({ userId }: { userId: string }) {
	const [messages, setMessages] = useState<Message[]>([])
	const [input, setInput] = useState('')
	const { processUserInput, storeAssistantResponse, isProcessing } = useInterviewRAG()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!input.trim() || isProcessing) return

		const userMessage = input.trim()
		setInput('')

		// Add user message to chat
		setMessages((prev) => [...prev, { role: 'user', content: userMessage }])

		try {
			// Process with RAG agent
			const ragResult = await processUserInput(userMessage, userId)

			if (ragResult.type === 'off-topic') {
				// RAG agent handled off-topic query directly
				setMessages((prev) => [
					...prev,
					{
						role: 'assistant',
						content: ragResult.response!,
					},
				])
				return
			}

			// Send enhanced prompt to your main LLM
			const enhancedPrompt =
				ragResult.type === 'enhanced' ? ragResult.enhancedPrompt : ragResult.originalQuery

			// Call your existing interview API with enhanced prompt
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					message: enhancedPrompt,
					userId,
				}),
			})

			const data = await response.json()
			const assistantResponse = data.reply

			// Store assistant response for future context
			await storeAssistantResponse(assistantResponse)

			// Add to chat
			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content: assistantResponse,
				},
			])
		} catch (error) {
			console.error('Chat error:', error)
			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content: 'Sorry, something went wrong. Please try again.',
				},
			])
		}
	}

	return (
		<div className="mx-auto flex h-full max-w-4xl flex-col">
			{/* Messages */}
			<div className="flex-1 space-y-4 overflow-y-auto p-4">
				{messages.map((message, index) => (
					<div
						key={index}
						className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
					>
						<div
							className={`max-w-[80%] rounded-lg p-3 ${
								message.role === 'user'
									? 'bg-apple-blue text-white'
									: 'bg-gray-100 text-black dark:bg-gray-800 dark:text-white'
							}`}
						>
							{message.content}
						</div>
					</div>
				))}
				{isProcessing && (
					<div className="flex justify-start">
						<div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
							<div className="flex space-x-1">
								<div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
								<div
									className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
									style={{ animationDelay: '0.1s' }}
								></div>
								<div
									className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
									style={{ animationDelay: '0.2s' }}
								></div>
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Input */}
			<form
				onSubmit={handleSubmit}
				className="border-t border-gray-200 p-4 dark:border-gray-700"
			>
				<div className="flex gap-2">
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Type your response..."
						className="focus:border-apple-blue min-h-[44px] flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-black focus:outline-none dark:border-gray-700 dark:bg-black dark:text-white"
						disabled={isProcessing}
					/>
					<button
						type="submit"
						disabled={!input.trim() || isProcessing}
						className="bg-apple-blue min-h-[44px] rounded-lg px-6 py-3 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
					>
						Send
					</button>
				</div>
			</form>
		</div>
	)
}
