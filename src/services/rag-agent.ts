import { PromptTemplate } from '@prompt-template/core'
import { embed, generateObject } from 'ai'
import { and, cosineDistance, desc, eq, gt, sql } from 'drizzle-orm'
import z from 'zod'

import { db } from '~/db'
import { embeddings } from '~/db/models'

type RAGResponse =
	| {
			isRelevant: false
			response: string
			enhancedPrompt?: never
	  }
	| {
			isRelevant: true
			response?: never
			enhancedPrompt: string
	  }

export class InterviewRAGAgent {
	async processQuery(userQuery: string, userId: string): Promise<RAGResponse> {
		console.log('\n\n\n🤖 RAG AGENT PROCESSING')
		console.log('📝 User Query:', userQuery)
		console.log('👤 User ID:', userId)

		// Step 1: Quick relevance check
		console.log('\n\n\n🔍 STEP 1: Checking relevance...')
		const isRelevant = await this.checkRelevance(userQuery)

		if (!isRelevant) {
			console.log('❌ Query deemed OFF-TOPIC')
			console.log('🚫 Blocking query and responding directly')

			return {
				isRelevant: false,
				response:
					"Let's stay focused on the interview. Please continue with interview-related questions.",
			}
		}

		console.log('✅ Query is INTERVIEW-RELEVANT')

		// Step 2: Get relevant conversation context
		console.log('\n\n\n🧠 STEP 2: Retrieving conversation context...')
		const context = await this.getRelevantContext(userQuery, userId)

		// Step 3: Generate enhanced prompt
		console.log('\n\n\n⚡ STEP 3: Creating enhanced prompt...')
		const enhancedPrompt = this.createEnhancedPrompt(userQuery, context)
		console.log('📤 Enhanced prompt ready for main LLM')
		console.log('🎯 RAG AGENT COMPLETE')

		return {
			isRelevant: true,
			enhancedPrompt,
		}
	}

	private async checkRelevance(query: string) {
		const promptTemplate = PromptTemplate.create`
			Is this query relevant to a job interview context? Answer only "YES" or "NO": "${'query'}"
		`

		const result = await generateObject({
			model: 'moonshotai/kimi-k2',
			prompt: promptTemplate.format({
				query,
			}),
			schema: z.object({
				isRelevant: z.boolean(),
			}),
		})

		return result.object.isRelevant
	}

	private async getRelevantContext(query: string, userId: string): Promise<string[]> {
		const queryEmbedding = await embed({
			model: 'openai/text-embedding-3-small',
			value: query,
		})

		const RELEVANCE_THRESHOLD = 0.7
		const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, queryEmbedding.embedding)}`

		const similarConversations = await db
			.select({
				content: embeddings.content,
				similarity,
			})
			.from(embeddings)
			.where(and(eq(embeddings.userId, userId), gt(similarity, RELEVANCE_THRESHOLD)))
			.orderBy((t) => desc(t.similarity))
			.limit(3)

		return similarConversations.map((conversation) => {
			return conversation.content
		})
	}

	private createEnhancedPrompt(userQuery: string, context: string[]): string {
		const contextText =
			context.length > 0 ? `Previous conversation context:\n${context.join('\n---\n')}\n\n` : ''

		const enhancedPrompt = `${contextText}Current user query: ${userQuery}`

		console.log('📝 Enhanced prompt structure:')
		console.log(`  📚 Context pieces: ${String(context.length)}`)
		console.log(`  📏 Total prompt length: ${String(enhancedPrompt.length)} characters`)

		if (context.length > 0) {
			console.log('  🧠 Using conversation history for context-aware response')
		} else {
			console.log('  🆕 No previous context - treating as fresh conversation')
		}

		return enhancedPrompt
	}
}
