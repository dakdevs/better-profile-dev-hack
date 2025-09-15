'use client'

import { useEffect, useState } from 'react'

import { AvailabilityCalendar } from '~/components/availability-calendar'
import { AvailabilityList } from '~/components/availability-list'
import { AvailabilitySlotForm } from '~/components/availability-slot-form'
import {
	AvailabilityListResponse,
	AvailabilityResponse,
	CandidateAvailability,
	CreateAvailabilityRequest,
	DeleteAvailabilityResponse,
	TimeSlot,
	UpdateAvailabilityRequest,
} from '~/types/interview-management'

type ViewMode = 'calendar' | 'list'
type FormMode = 'create' | 'edit' | null

export function AvailabilityManagementPage() {
	const [availability, setAvailability] = useState<CandidateAvailability[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [viewMode, setViewMode] = useState<ViewMode>('calendar')
	const [formMode, setFormMode] = useState<FormMode>(null)
	const [selectedAvailability, setSelectedAvailability] = useState<CandidateAvailability | null>(
		null,
	)
	const [selectedDate, setSelectedDate] = useState<Date | null>(null)
	const [timezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone)

	// Load availability data
	useEffect(() => {
		loadAvailability()
	}, [])

	const loadAvailability = async () => {
		try {
			setIsLoading(true)
			setError(null)

			const response = await fetch('/api/availability')
			const data: AvailabilityListResponse = await response.json()

			if (!data.success) {
				throw new Error(data.error || 'Failed to load availability')
			}

			// Convert date strings to Date objects
			const availabilityWithDates = data.data!.availability.map((slot) => ({
				...slot,
				startTime: new Date(slot.startTime),
				endTime: new Date(slot.endTime),
				createdAt: new Date(slot.createdAt),
				updatedAt: new Date(slot.updatedAt),
			}))

			setAvailability(availabilityWithDates)
		} catch (error) {
			console.error('Error loading availability:', error)
			setError(error instanceof Error ? error.message : 'Failed to load availability')
		} finally {
			setIsLoading(false)
		}
	}

	// Handle creating new availability
	const handleCreateAvailability = async (data: CreateAvailabilityRequest) => {
		try {
			setIsSubmitting(true)
			setError(null)

			const response = await fetch('/api/availability', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			})

			const result: AvailabilityResponse = await response.json()

			if (!result.success) {
				throw new Error(result.error || 'Failed to create availability')
			}

			// Reload availability data
			await loadAvailability()

			// Close form
			setFormMode(null)
			setSelectedDate(null)
		} catch (error) {
			console.error('Error creating availability:', error)
			setError(error instanceof Error ? error.message : 'Failed to create availability')
		} finally {
			setIsSubmitting(false)
		}
	}

	// Handle updating availability
	const handleUpdateAvailability = async (data: UpdateAvailabilityRequest) => {
		if (!selectedAvailability) return

		try {
			setIsSubmitting(true)
			setError(null)

			const response = await fetch(`/api/availability/${selectedAvailability.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			})

			const result: AvailabilityResponse = await response.json()

			if (!result.success) {
				throw new Error(result.error || 'Failed to update availability')
			}

			// Reload availability data
			await loadAvailability()

			// Close form
			setFormMode(null)
			setSelectedAvailability(null)
		} catch (error) {
			console.error('Error updating availability:', error)
			setError(error instanceof Error ? error.message : 'Failed to update availability')
		} finally {
			setIsSubmitting(false)
		}
	}

	// Handle deleting availability
	const handleDeleteAvailability = async (availabilityId: string) => {
		try {
			setError(null)

			const response = await fetch(`/api/availability/${availabilityId}`, {
				method: 'DELETE',
			})

			const result: DeleteAvailabilityResponse = await response.json()

			if (!result.success) {
				if (result.data?.conflictingInterviews && result.data.conflictingInterviews.length > 0) {
					alert(
						`Cannot delete this availability slot because it has ${result.data.conflictingInterviews.length} scheduled interview(s). Please reschedule or cancel the interviews first.`,
					)
					return
				}
				throw new Error(result.error || 'Failed to delete availability')
			}

			// Reload availability data
			await loadAvailability()
		} catch (error) {
			console.error('Error deleting availability:', error)
			setError(error instanceof Error ? error.message : 'Failed to delete availability')
		}
	}

	// Handle calendar slot selection
	const handleSlotSelect = (slot: TimeSlot) => {
		setSelectedDate(slot.start)
		setFormMode('create')
	}

	// Handle editing availability
	const handleEditAvailability = (availability: CandidateAvailability) => {
		setSelectedAvailability(availability)
		setFormMode('edit')
	}

	// Handle form cancel
	const handleFormCancel = () => {
		setFormMode(null)
		setSelectedAvailability(null)
		setSelectedDate(null)
	}

	// Handle form submit
	const handleFormSubmit = async (data: CreateAvailabilityRequest | UpdateAvailabilityRequest) => {
		if (formMode === 'create') {
			await handleCreateAvailability(data as CreateAvailabilityRequest)
		} else if (formMode === 'edit') {
			await handleUpdateAvailability(data as UpdateAvailabilityRequest)
		}
	}

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold text-black dark:text-white">
						Interview Availability
					</h1>
					<p className="mt-1 text-gray-600 dark:text-gray-400">
						Manage your available times for interviews
					</p>
				</div>

				<div className="flex items-center gap-3">
					{/* View Mode Toggle */}
					<div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
						<button
							onClick={() => setViewMode('calendar')}
							className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
								viewMode === 'calendar'
									? 'bg-white text-black shadow-sm dark:bg-black dark:text-white'
									: 'text-gray-600 hover:text-black dark:text-gray-400 hover:dark:text-white'
							}`}
						>
							Calendar
						</button>
						<button
							onClick={() => setViewMode('list')}
							className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
								viewMode === 'list'
									? 'bg-white text-black shadow-sm dark:bg-black dark:text-white'
									: 'text-gray-600 hover:text-black dark:text-gray-400 hover:dark:text-white'
							}`}
						>
							List
						</button>
					</div>

					{/* Add Availability Button */}
					<button
						onClick={() => setFormMode('create')}
						className="bg-apple-blue flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors duration-150 hover:bg-blue-600"
					>
						<svg
							className="h-5 w-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							/>
						</svg>
						Add Availability
					</button>
				</div>
			</div>

			{/* Error Message */}
			{error && (
				<div className="bg-apple-red/10 border-apple-red/20 text-apple-red rounded-lg border px-4 py-3">
					{error}
				</div>
			)}

			{/* Form Modal */}
			{formMode && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
					<div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-black">
						<AvailabilitySlotForm
							availability={selectedAvailability || undefined}
							initialDate={selectedDate || undefined}
							onSubmit={handleFormSubmit}
							onCancel={handleFormCancel}
							isLoading={isSubmitting}
						/>
					</div>
				</div>
			)}

			{/* Loading State */}
			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<div className="border-t-apple-blue h-8 w-8 animate-spin rounded-full border-2 border-gray-200"></div>
				</div>
			) : (
				<>
					{/* Calendar View */}
					{viewMode === 'calendar' && (
						<AvailabilityCalendar
							availability={availability}
							onSlotSelect={handleSlotSelect}
							onSlotEdit={handleEditAvailability}
							timezone={timezone}
						/>
					)}

					{/* List View */}
					{viewMode === 'list' && (
						<AvailabilityList
							availability={availability}
							onEdit={handleEditAvailability}
							onDelete={handleDeleteAvailability}
							timezone={timezone}
						/>
					)}
				</>
			)}

			{/* Stats Summary */}
			{!isLoading && availability.length > 0 && (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
						<div className="mb-1 text-2xl font-semibold text-black dark:text-white">
							{availability.filter((a) => a.status === 'available').length}
						</div>
						<div className="text-sm text-gray-600 dark:text-gray-400">Available Slots</div>
					</div>

					<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
						<div className="mb-1 text-2xl font-semibold text-black dark:text-white">
							{availability.filter((a) => a.status === 'booked').length}
						</div>
						<div className="text-sm text-gray-600 dark:text-gray-400">Booked Slots</div>
					</div>

					<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
						<div className="mb-1 text-2xl font-semibold text-black dark:text-white">
							{availability.filter((a) => a.isRecurring).length}
						</div>
						<div className="text-sm text-gray-600 dark:text-gray-400">Recurring Slots</div>
					</div>
				</div>
			)}
		</div>
	)
}
