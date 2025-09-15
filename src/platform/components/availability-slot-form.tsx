'use client'

import { useEffect, useState } from 'react'

import {
	AvailabilityStatus,
	CandidateAvailability,
	CreateAvailabilityRequest,
	RecurrencePattern,
	RecurrenceType,
	UpdateAvailabilityRequest,
} from '~/types/interview-management'

interface AvailabilitySlotFormProps {
	availability?: CandidateAvailability
	initialDate?: Date
	onSubmit: (data: CreateAvailabilityRequest | UpdateAvailabilityRequest) => Promise<void>
	onCancel: () => void
	isLoading?: boolean
}

export function AvailabilitySlotForm({
	availability,
	initialDate,
	onSubmit,
	onCancel,
	isLoading = false,
}: AvailabilitySlotFormProps) {
	const [formData, setFormData] = useState({
		startTime: '',
		endTime: '',
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		status: 'available' as AvailabilityStatus,
		isRecurring: false,
		recurrenceType: 'weekly' as RecurrenceType,
		recurrenceInterval: 1,
		recurrenceDaysOfWeek: [] as number[],
		recurrenceEndDate: '',
		recurrenceMaxOccurrences: 10,
	})

	const [errors, setErrors] = useState<Record<string, string>>({})

	// Initialize form data
	useEffect(() => {
		if (availability) {
			// Editing existing availability
			const startTime = new Date(availability.startTime)
			const endTime = new Date(availability.endTime)

			setFormData({
				startTime: formatDateTimeLocal(startTime),
				endTime: formatDateTimeLocal(endTime),
				timezone: availability.timezone,
				status: availability.status,
				isRecurring: availability.isRecurring,
				recurrenceType: availability.recurrencePattern?.type || 'weekly',
				recurrenceInterval: availability.recurrencePattern?.interval || 1,
				recurrenceDaysOfWeek: availability.recurrencePattern?.daysOfWeek || [],
				recurrenceEndDate: availability.recurrencePattern?.endDate
					? formatDateTimeLocal(new Date(availability.recurrencePattern.endDate))
					: '',
				recurrenceMaxOccurrences: availability.recurrencePattern?.maxOccurrences || 10,
			})
		} else if (initialDate) {
			// Creating new availability with initial date
			const startTime = new Date(initialDate)
			startTime.setHours(9, 0, 0, 0) // Default to 9 AM
			const endTime = new Date(startTime)
			endTime.setHours(10, 0, 0, 0) // Default to 10 AM (1 hour)

			setFormData((prev) => ({
				...prev,
				startTime: formatDateTimeLocal(startTime),
				endTime: formatDateTimeLocal(endTime),
			}))
		}
	}, [availability, initialDate])

	// Format date for datetime-local input
	const formatDateTimeLocal = (date: Date): string => {
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		const hours = String(date.getHours()).padStart(2, '0')
		const minutes = String(date.getMinutes()).padStart(2, '0')
		return `${year}-${month}-${day}T${hours}:${minutes}`
	}

	// Handle form field changes
	const handleChange = (field: string, value: any) => {
		setFormData((prev) => ({ ...prev, [field]: value }))

		// Clear error when field is updated
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: '' }))
		}
	}

	// Handle days of week selection for weekly recurrence
	const handleDayOfWeekToggle = (dayIndex: number) => {
		setFormData((prev) => ({
			...prev,
			recurrenceDaysOfWeek: prev.recurrenceDaysOfWeek.includes(dayIndex)
				? prev.recurrenceDaysOfWeek.filter((d) => d !== dayIndex)
				: [...prev.recurrenceDaysOfWeek, dayIndex].sort(),
		}))
	}

	// Validate form
	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {}

		if (!formData.startTime) {
			newErrors.startTime = 'Start time is required'
		}

		if (!formData.endTime) {
			newErrors.endTime = 'End time is required'
		}

		if (formData.startTime && formData.endTime) {
			const start = new Date(formData.startTime)
			const end = new Date(formData.endTime)

			if (end <= start) {
				newErrors.endTime = 'End time must be after start time'
			}

			if (!availability && start <= new Date()) {
				newErrors.startTime = 'Start time must be in the future'
			}
		}

		if (!formData.timezone) {
			newErrors.timezone = 'Timezone is required'
		}

		if (formData.isRecurring) {
			if (formData.recurrenceType === 'weekly' && formData.recurrenceDaysOfWeek.length === 0) {
				newErrors.recurrenceDaysOfWeek = 'Select at least one day of the week'
			}

			if (formData.recurrenceInterval < 1) {
				newErrors.recurrenceInterval = 'Interval must be at least 1'
			}
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	// Handle form submission
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateForm()) {
			return
		}

		try {
			const baseData = {
				startTime: formData.startTime,
				endTime: formData.endTime,
				timezone: formData.timezone,
				...(availability && { status: formData.status }),
			}

			let submitData: CreateAvailabilityRequest | UpdateAvailabilityRequest

			if (formData.isRecurring) {
				const recurrencePattern: RecurrencePattern = {
					type: formData.recurrenceType,
					interval: formData.recurrenceInterval,
					...(formData.recurrenceType === 'weekly' && {
						daysOfWeek: formData.recurrenceDaysOfWeek,
					}),
					...(formData.recurrenceEndDate && { endDate: new Date(formData.recurrenceEndDate) }),
					maxOccurrences: formData.recurrenceMaxOccurrences,
				}

				submitData = {
					...baseData,
					isRecurring: true,
					recurrencePattern,
				}
			} else {
				submitData = {
					...baseData,
					isRecurring: false,
				}
			}

			await onSubmit(submitData)
		} catch (error) {
			console.error('Form submission error:', error)
		}
	}

	const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
			<div className="mb-6">
				<h3 className="mb-2 text-xl font-semibold text-black dark:text-white">
					{availability ? 'Edit Availability' : 'Add Availability'}
				</h3>
				<p className="text-gray-600 dark:text-gray-400">Set your available times for interviews</p>
			</div>

			<form
				onSubmit={handleSubmit}
				className="space-y-6"
			>
				{/* Time Range */}
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<label
							htmlFor="startTime"
							className="mb-2 block text-sm font-medium text-black dark:text-white"
						>
							Start Time *
						</label>
						<input
							type="datetime-local"
							id="startTime"
							value={formData.startTime}
							onChange={(e) => handleChange('startTime', e.target.value)}
							className={`focus:border-apple-blue min-h-[44px] w-full rounded-lg border bg-white px-4 py-3 text-black transition-colors duration-150 outline-none focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:bg-black dark:text-white ${
								errors.startTime ? 'border-apple-red' : 'border-gray-200 dark:border-gray-700'
							}`}
							disabled={isLoading}
						/>
						{errors.startTime && <p className="text-apple-red mt-1 text-sm">{errors.startTime}</p>}
					</div>

					<div>
						<label
							htmlFor="endTime"
							className="mb-2 block text-sm font-medium text-black dark:text-white"
						>
							End Time *
						</label>
						<input
							type="datetime-local"
							id="endTime"
							value={formData.endTime}
							onChange={(e) => handleChange('endTime', e.target.value)}
							className={`focus:border-apple-blue min-h-[44px] w-full rounded-lg border bg-white px-4 py-3 text-black transition-colors duration-150 outline-none focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:bg-black dark:text-white ${
								errors.endTime ? 'border-apple-red' : 'border-gray-200 dark:border-gray-700'
							}`}
							disabled={isLoading}
						/>
						{errors.endTime && <p className="text-apple-red mt-1 text-sm">{errors.endTime}</p>}
					</div>
				</div>

				{/* Timezone */}
				<div>
					<label
						htmlFor="timezone"
						className="mb-2 block text-sm font-medium text-black dark:text-white"
					>
						Timezone *
					</label>
					<select
						id="timezone"
						value={formData.timezone}
						onChange={(e) => handleChange('timezone', e.target.value)}
						className={`focus:border-apple-blue min-h-[44px] w-full rounded-lg border bg-white px-4 py-3 text-black transition-colors duration-150 outline-none focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:bg-black dark:text-white ${
							errors.timezone ? 'border-apple-red' : 'border-gray-200 dark:border-gray-700'
						}`}
						disabled={isLoading}
					>
						<option value="UTC">UTC</option>
						<option value="America/New_York">Eastern Time</option>
						<option value="America/Chicago">Central Time</option>
						<option value="America/Denver">Mountain Time</option>
						<option value="America/Los_Angeles">Pacific Time</option>
						<option value="Europe/London">London</option>
						<option value="Europe/Paris">Paris</option>
						<option value="Asia/Tokyo">Tokyo</option>
						<option value="Asia/Shanghai">Shanghai</option>
						<option value="Australia/Sydney">Sydney</option>
					</select>
					{errors.timezone && <p className="text-apple-red mt-1 text-sm">{errors.timezone}</p>}
				</div>

				{/* Status (only for editing) */}
				{availability && (
					<div>
						<label
							htmlFor="status"
							className="mb-2 block text-sm font-medium text-black dark:text-white"
						>
							Status
						</label>
						<select
							id="status"
							value={formData.status}
							onChange={(e) => handleChange('status', e.target.value as AvailabilityStatus)}
							className="focus:border-apple-blue min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-black transition-colors duration-150 outline-none focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white"
							disabled={isLoading}
						>
							<option value="available">Available</option>
							<option value="unavailable">Unavailable</option>
						</select>
					</div>
				)}

				{/* Recurring Options */}
				<div>
					<label className="flex cursor-pointer items-center gap-2">
						<input
							type="checkbox"
							checked={formData.isRecurring}
							onChange={(e) => handleChange('isRecurring', e.target.checked)}
							className="text-apple-blue focus:ring-apple-blue h-4 w-4 rounded border-gray-300"
							disabled={isLoading}
						/>
						<span className="text-sm font-medium text-black dark:text-white">
							Make this recurring
						</span>
					</label>
				</div>

				{formData.isRecurring && (
					<div className="space-y-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<label
									htmlFor="recurrenceType"
									className="mb-2 block text-sm font-medium text-black dark:text-white"
								>
									Repeat
								</label>
								<select
									id="recurrenceType"
									value={formData.recurrenceType}
									onChange={(e) => handleChange('recurrenceType', e.target.value as RecurrenceType)}
									className="focus:border-apple-blue min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-black transition-colors duration-150 outline-none focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white"
									disabled={isLoading}
								>
									<option value="daily">Daily</option>
									<option value="weekly">Weekly</option>
									<option value="monthly">Monthly</option>
								</select>
							</div>

							<div>
								<label
									htmlFor="recurrenceInterval"
									className="mb-2 block text-sm font-medium text-black dark:text-white"
								>
									Every
								</label>
								<input
									type="number"
									id="recurrenceInterval"
									min="1"
									max="12"
									value={formData.recurrenceInterval}
									onChange={(e) => handleChange('recurrenceInterval', parseInt(e.target.value))}
									className={`focus:border-apple-blue min-h-[44px] w-full rounded-lg border bg-white px-4 py-3 text-black transition-colors duration-150 outline-none focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:bg-black dark:text-white ${
										errors.recurrenceInterval
											? 'border-apple-red'
											: 'border-gray-200 dark:border-gray-700'
									}`}
									disabled={isLoading}
								/>
								{errors.recurrenceInterval && (
									<p className="text-apple-red mt-1 text-sm">{errors.recurrenceInterval}</p>
								)}
							</div>
						</div>

						{formData.recurrenceType === 'weekly' && (
							<div>
								<label className="mb-2 block text-sm font-medium text-black dark:text-white">
									Days of the week
								</label>
								<div className="flex flex-wrap gap-2">
									{dayNames.map((day, index) => (
										<label
											key={index}
											className="flex cursor-pointer items-center gap-1"
										>
											<input
												type="checkbox"
												checked={formData.recurrenceDaysOfWeek.includes(index)}
												onChange={() => handleDayOfWeekToggle(index)}
												className="text-apple-blue focus:ring-apple-blue h-4 w-4 rounded border-gray-300"
												disabled={isLoading}
											/>
											<span className="text-sm text-black dark:text-white">{day.slice(0, 3)}</span>
										</label>
									))}
								</div>
								{errors.recurrenceDaysOfWeek && (
									<p className="text-apple-red mt-1 text-sm">{errors.recurrenceDaysOfWeek}</p>
								)}
							</div>
						)}

						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<label
									htmlFor="recurrenceEndDate"
									className="mb-2 block text-sm font-medium text-black dark:text-white"
								>
									End Date (optional)
								</label>
								<input
									type="date"
									id="recurrenceEndDate"
									value={formData.recurrenceEndDate}
									onChange={(e) => handleChange('recurrenceEndDate', e.target.value)}
									className="focus:border-apple-blue min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-black transition-colors duration-150 outline-none focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white"
									disabled={isLoading}
								/>
							</div>

							<div>
								<label
									htmlFor="recurrenceMaxOccurrences"
									className="mb-2 block text-sm font-medium text-black dark:text-white"
								>
									Max Occurrences
								</label>
								<input
									type="number"
									id="recurrenceMaxOccurrences"
									min="1"
									max="100"
									value={formData.recurrenceMaxOccurrences}
									onChange={(e) =>
										handleChange('recurrenceMaxOccurrences', parseInt(e.target.value))
									}
									className="focus:border-apple-blue min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-black transition-colors duration-150 outline-none focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white"
									disabled={isLoading}
								/>
							</div>
						</div>
					</div>
				)}

				{/* Form Actions */}
				<div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
					<button
						type="button"
						onClick={onCancel}
						className="px-6 py-3 text-gray-600 transition-colors duration-150 hover:text-black dark:text-gray-400 hover:dark:text-white"
						disabled={isLoading}
					>
						Cancel
					</button>
					<button
						type="submit"
						className="bg-apple-blue rounded-lg px-6 py-3 text-white transition-colors duration-150 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
						disabled={isLoading}
					>
						{isLoading ? 'Saving...' : availability ? 'Update' : 'Add'} Availability
					</button>
				</div>
			</form>
		</div>
	)
}
