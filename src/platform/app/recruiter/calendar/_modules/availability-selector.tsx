'use client'

import { useState } from 'react'

interface AvailabilitySlot {
	dayOfWeek: string
	startTime: string
	endTime: string
	timezone: string
}

interface AvailabilitySelectorProps {
	availability: AvailabilitySlot[]
	onChange: (availability: AvailabilitySlot[]) => void
}

const DAYS_OF_WEEK = [
	{ value: 'monday', label: 'Monday' },
	{ value: 'tuesday', label: 'Tuesday' },
	{ value: 'wednesday', label: 'Wednesday' },
	{ value: 'thursday', label: 'Thursday' },
	{ value: 'friday', label: 'Friday' },
	{ value: 'saturday', label: 'Saturday' },
	{ value: 'sunday', label: 'Sunday' },
]

const TIME_SLOTS = [
	'08:00',
	'08:30',
	'09:00',
	'09:30',
	'10:00',
	'10:30',
	'11:00',
	'11:30',
	'12:00',
	'12:30',
	'13:00',
	'13:30',
	'14:00',
	'14:30',
	'15:00',
	'15:30',
	'16:00',
	'16:30',
	'17:00',
	'17:30',
	'18:00',
	'18:30',
	'19:00',
	'19:30',
	'20:00',
]

const TIMEZONES = [
	{ value: 'UTC', label: 'UTC' },
	{ value: 'America/New_York', label: 'Eastern Time (ET)' },
	{ value: 'America/Chicago', label: 'Central Time (CT)' },
	{ value: 'America/Denver', label: 'Mountain Time (MT)' },
	{ value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
	{ value: 'Europe/London', label: 'GMT' },
	{ value: 'Europe/Paris', label: 'CET' },
	{ value: 'Asia/Tokyo', label: 'JST' },
]

export function AvailabilitySelector({ availability, onChange }: AvailabilitySelectorProps) {
	const [selectedDays, setSelectedDays] = useState<Set<string>>(
		new Set(availability.map((slot) => slot.dayOfWeek)),
	)

	const addAvailabilitySlot = (dayOfWeek: string) => {
		const newSlot: AvailabilitySlot = {
			dayOfWeek,
			startTime: '09:00',
			endTime: '17:00',
			timezone: 'UTC',
		}

		const newAvailability = [...availability, newSlot]
		onChange(newAvailability)
		setSelectedDays((prev) => new Set([...prev, dayOfWeek]))
	}

	const removeAvailabilitySlot = (dayOfWeek: string) => {
		const newAvailability = availability.filter((slot) => slot.dayOfWeek !== dayOfWeek)
		onChange(newAvailability)
		setSelectedDays((prev) => {
			const newSet = new Set(prev)
			newSet.delete(dayOfWeek)
			return newSet
		})
	}

	const updateAvailabilitySlot = (
		dayOfWeek: string,
		field: keyof AvailabilitySlot,
		value: string,
	) => {
		const newAvailability = availability.map((slot) =>
			slot.dayOfWeek === dayOfWeek ? { ...slot, [field]: value } : slot,
		)
		onChange(newAvailability)
	}

	const getSlotForDay = (dayOfWeek: string) => {
		return availability.find((slot) => slot.dayOfWeek === dayOfWeek)
	}

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
				{DAYS_OF_WEEK.map((day) => {
					const isSelected = selectedDays.has(day.value)
					const slot = getSlotForDay(day.value)

					return (
						<div
							key={day.value}
							className={`rounded-lg border p-4 transition-all duration-200 ${
								isSelected
									? 'border-apple-blue bg-apple-blue/5 dark:bg-apple-blue/10'
									: 'border-gray-200 bg-white dark:border-gray-700 dark:bg-black'
							}`}
						>
							<div className="mb-3 flex items-center justify-between">
								<label className="flex cursor-pointer items-center gap-2">
									<input
										type="checkbox"
										checked={isSelected}
										onChange={(e) => {
											if (e.target.checked) {
												addAvailabilitySlot(day.value)
											} else {
												removeAvailabilitySlot(day.value)
											}
										}}
										className="text-apple-blue focus:ring-apple-blue h-4 w-4 rounded border-gray-300 bg-white focus:ring-2"
									/>
									<span className="font-medium text-black dark:text-white">{day.label}</span>
								</label>
							</div>

							{isSelected && slot && (
								<div className="space-y-3">
									<div className="grid grid-cols-2 gap-2">
										<div>
											<label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
												Start Time
											</label>
											<select
												value={slot.startTime}
												onChange={(e) =>
													updateAvailabilitySlot(day.value, 'startTime', e.target.value)
												}
												className="focus:border-apple-blue w-full rounded border border-gray-200 bg-white px-2 py-1 text-sm text-black focus:outline-none dark:border-gray-700 dark:bg-black dark:text-white"
											>
												{TIME_SLOTS.map((time) => (
													<option
														key={time}
														value={time}
													>
														{time}
													</option>
												))}
											</select>
										</div>
										<div>
											<label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
												End Time
											</label>
											<select
												value={slot.endTime}
												onChange={(e) =>
													updateAvailabilitySlot(day.value, 'endTime', e.target.value)
												}
												className="focus:border-apple-blue w-full rounded border border-gray-200 bg-white px-2 py-1 text-sm text-black focus:outline-none dark:border-gray-700 dark:bg-black dark:text-white"
											>
												{TIME_SLOTS.map((time) => (
													<option
														key={time}
														value={time}
													>
														{time}
													</option>
												))}
											</select>
										</div>
									</div>
									<div>
										<label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
											Timezone
										</label>
										<select
											value={slot.timezone}
											onChange={(e) =>
												updateAvailabilitySlot(day.value, 'timezone', e.target.value)
											}
											className="focus:border-apple-blue w-full rounded border border-gray-200 bg-white px-2 py-1 text-sm text-black focus:outline-none dark:border-gray-700 dark:bg-black dark:text-white"
										>
											{TIMEZONES.map((tz) => (
												<option
													key={tz.value}
													value={tz.value}
												>
													{tz.label}
												</option>
											))}
										</select>
									</div>
								</div>
							)}
						</div>
					)
				})}
			</div>

			{availability.length > 0 && (
				<div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
					<h3 className="mb-2 text-sm font-medium text-black dark:text-white">
						Summary of Availability
					</h3>
					<div className="space-y-1">
						{availability.map((slot) => (
							<div
								key={slot.dayOfWeek}
								className="text-sm text-gray-600 dark:text-gray-400"
							>
								<span className="font-medium capitalize">{slot.dayOfWeek}</span>: {slot.startTime} -{' '}
								{slot.endTime} ({slot.timezone})
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
