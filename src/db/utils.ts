import { timestamp } from 'drizzle-orm/pg-core'

export const createdAtTimestamp = () => {
	return timestamp().notNull().defaultNow()
}

export const updatedAtTimestamp = () => {
	return timestamp()
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
}

export const timestamps = {
	createdAt: createdAtTimestamp(),
	updatedAt: updatedAtTimestamp(),
}
