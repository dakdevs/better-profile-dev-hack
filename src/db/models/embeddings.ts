// src/db/models/embeddings.ts
import { pgTable, text, timestamp, vector, index, bigserial, integer, uuid } from 'drizzle-orm/pg-core';
import { users } from './users';
import { interviewSessions } from './interviews';

export const embeddings = pgTable('embeddings', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), // Changed to uuid
	sessionId: text('session_id').references(() => interviewSessions.id, { onDelete: 'cascade' }),
	content: text('content').notNull(),
	embedding: vector('embedding', { dimensions: 768 }),
	messageIndex: integer('message_index'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
	embeddingIdx: index('embeddings_embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
}));