import { randomBytes } from 'crypto'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

/**
 * Generate a unique ID using crypto.randomBytes
 */
export function generateId(length: number = 16): string {
	return randomBytes(length).toString('hex')
}
