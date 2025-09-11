// src/db/models/embeddings.ts

import {
	bigserial,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
	vector,
} from 'drizzle-orm/pg-core'

import { interviewSessions } from './interviews'
import { users } from './users'

export const embeddings = pgTable(
	'embeddings',
	{
		id: bigserial('id').primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		sessionId: text('session_id').references(() => interviewSessions.id, { onDelete: 'cascade' }),
		content: text('content').notNull(),
		embedding: vector('embedding', { dimensions: 768 }),
		messageIndex: integer('message_index'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	{
		embeddingIdx: index('embeddings_embedding_idx').on('embedding vector_cosine_ops hnsw'),
	},
)
