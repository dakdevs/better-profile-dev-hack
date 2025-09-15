'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Circle, Clock, Plus } from 'lucide-react'

const initialTasks = [
	{
		id: 1,
		title: 'Review Q4 analytics report',
		priority: 'high' as const,
		completed: false,
		dueDate: '2025-01-10',
	},
	{
		id: 2,
		title: 'Update user documentation',
		priority: 'medium' as const,
		completed: true,
		dueDate: '2025-01-08',
	},
	{
		id: 3,
		title: 'Schedule team meeting',
		priority: 'low' as const,
		completed: false,
		dueDate: '2025-01-12',
	},
	{
		id: 4,
		title: 'Optimize database queries',
		priority: 'high' as const,
		completed: false,
		dueDate: '2025-01-09',
	},
]

const priorityColors = {
	high: 'text-red-600 bg-red-50',
	medium: 'text-orange-600 bg-orange-50',
	low: 'text-green-600 bg-green-50',
}

export function TasksWidget() {
	const [tasks, setTasks] = useState(initialTasks)
	const [showCompleted, setShowCompleted] = useState(true)

	const toggleTask = (id: number) => {
		setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
	}

	const filteredTasks = showCompleted ? tasks : tasks.filter((task) => !task.completed)
	const completedCount = tasks.filter((task) => task.completed).length
	const totalCount = tasks.length

	return (
		<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
					<p className="mt-1 text-sm text-gray-600">
						{completedCount} of {totalCount} completed
					</p>
				</div>
				<button className="rounded-lg p-2 transition-colors hover:bg-gray-100">
					<Plus className="h-4 w-4 text-gray-600" />
				</button>
			</div>

			{/* Progress Bar */}
			<div className="mb-6">
				<div className="mb-2 flex items-center justify-between text-sm">
					<span className="text-gray-600">Progress</span>
					<span className="font-medium text-gray-900">
						{Math.round((completedCount / totalCount) * 100)}%
					</span>
				</div>
				<div className="h-2 w-full rounded-full bg-gray-200">
					<div
						className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
						style={{ width: `${(completedCount / totalCount) * 100}%` }}
					></div>
				</div>
			</div>

			{/* Filter Toggle */}
			<div className="mb-4 flex items-center justify-between">
				<button
					onClick={() => setShowCompleted(!showCompleted)}
					className="text-sm font-medium text-blue-600 hover:text-blue-700"
				>
					{showCompleted ? 'Hide completed' : 'Show completed'}
				</button>
			</div>

			{/* Tasks List */}
			<div className="space-y-3">
				{filteredTasks.map((task) => {
					const isOverdue = new Date(task.dueDate) < new Date() && !task.completed

					return (
						<div
							key={task.id}
							className={`flex items-start gap-3 rounded-lg border p-3 transition-all hover:shadow-sm ${
								task.completed
									? 'border-gray-200 bg-gray-50'
									: 'border-gray-200 bg-white hover:border-gray-300'
							}`}
						>
							<button
								onClick={() => toggleTask(task.id)}
								className="mt-0.5 flex-shrink-0"
							>
								{task.completed ? (
									<CheckCircle2 className="h-5 w-5 text-green-600" />
								) : (
									<Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
								)}
							</button>

							<div className="min-w-0 flex-1">
								<div
									className={`text-sm font-medium ${
										task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
									}`}
								>
									{task.title}
								</div>

								<div className="mt-1 flex items-center gap-2">
									<span
										className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
											priorityColors[task.priority]
										}`}
									>
										{task.priority}
									</span>

									<div
										className={`flex items-center gap-1 text-xs ${
											isOverdue ? 'text-red-600' : 'text-gray-500'
										}`}
									>
										{isOverdue ? (
											<AlertTriangle className="h-3 w-3" />
										) : (
											<Clock className="h-3 w-3" />
										)}
										{new Date(task.dueDate).toLocaleDateString('en-US', {
											month: 'short',
											day: 'numeric',
										})}
									</div>
								</div>
							</div>
						</div>
					)
				})}
			</div>

			{filteredTasks.length === 0 && (
				<div className="py-8 text-center text-gray-500">
					<Circle className="mx-auto mb-2 h-8 w-8 opacity-50" />
					<p className="text-sm">No tasks to show</p>
				</div>
			)}
		</div>
	)
}
