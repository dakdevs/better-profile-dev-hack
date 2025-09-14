// src/utils/embeddings.ts

const HUGGINGFACE_MODEL_ID = 'BAAI/bge-base-en-v1.5'
const HUGGINGFACE_API_URL = `https://api-inference.huggingface.co/models/${HUGGINGFACE_MODEL_ID}`

export async function embedOne(input: string): Promise<number[]> {
	console.log('\n\n\n🔄 EMBEDDING GENERATION')
	console.log('📝 Input:', input.substring(0, 50) + '...')
	console.log('🔗 Using HuggingFace API URL:', HUGGINGFACE_API_URL)
	console.log('🔑 API Token available:', !!process.env.HUGGINGFACE_API_TOKEN)

	try {
		const response = await fetch(HUGGINGFACE_API_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${process.env.HUGGINGFACE_API_TOKEN ?? ''}`,
				'content-type': 'application/json',
			},
			body: JSON.stringify({
				inputs: input,
			}),
		})

		console.log('📡 HuggingFace API response status:', response.status)

		if (!response.ok) {
			const errorBody = await response.text()
			console.error('❌ HuggingFace API error body:', errorBody)
			throw new Error(
				`Hugging Face API request failed with status ${String(response.status)}: ${errorBody}`,
			)
		}

		const result: unknown = await response.json()
		console.log('📊 HuggingFace API result type:', typeof result)
		console.log('📊 HuggingFace API result is array:', Array.isArray(result))

		if (!Array.isArray(result)) {
			throw new Error('Unexpected response format: result is not an array')
		}

		// Check if it's a nested array (e.g., [[0.1, 0.2, ...]])
		if (
			result.length > 0
			&& Array.isArray(result[0])
			&& result[0].every((n: unknown): n is number => typeof n === 'number')
		) {
			console.log('✅ Embedding generated successfully (nested), dimensions:', result[0].length)

			return result[0]
		}
		// Check if it's a direct array of numbers (e.g., [0.1, 0.2, ...])
		if (result.every((n: unknown): n is number => typeof n === 'number')) {
			console.log('✅ Embedding generated successfully (direct), dimensions:', result.length)

			return result
		}

		console.error('❌ Invalid response structure from HuggingFace API')
		throw new Error('Unexpected response format: result elements are not numbers')
	} catch (error) {
		console.error('❌ Failed to get embedding from Hugging Face:', error)
		throw error
	}
}
