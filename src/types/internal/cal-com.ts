// src/types/internal/cal-com.ts

export interface CalComUser {
	id: number
	username: string
	name: string
	email: string
	timeZone: string
}

export interface CalComSchedule {
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

export interface CalComEventType {
	id: number
	title: string
	slug: string
	length: number
	hidden: boolean
	scheduleId: number
}

export interface CalComBooking {
	id: number
	uid: string
	title: string
	startTime: string
	endTime: string
	attendees: Array<{
		name: string
		email: string
		timeZone: string
	}>
	location?: string
	status: string
}

export interface CalComSlot {
	time: string
	attendees: number
}
