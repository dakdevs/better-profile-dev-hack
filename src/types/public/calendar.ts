// src/types/public/calendar.ts

/**
 * Calendar service user information
 */
export interface CalendarUser {
	id: number
	username: string
	name: string
	email: string
	timeZone: string
}

/**
 * Calendar schedule configuration
 */
export interface CalendarSchedule {
	id: number
	userId: number
	name: string
	timeZone: string
	availability: Array<{
		id: number
		days: number[]
		startTime: string
		endTime: string
	}>
}

/**
 * Calendar event type definition
 */
export interface CalendarEventType {
	id: number
	title: string
	slug: string
	length: number
	hidden: boolean
	scheduleId: number
}
