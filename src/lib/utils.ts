/**
 * Generates a simple, time-sortable, and reasonably unique ID.
 * Format: [prefix]_[timestamp_in_base36][random_part]
 * e.g., 'job_lqj5c4uoi9q'
 */
export function generateId(prefix: string = 'id'): string {
	const timestamp = Date.now().toString(36);
	const randomPart = Math.random().toString(36).substring(2, 9);
	return `${prefix}_${timestamp}${randomPart}`;
}