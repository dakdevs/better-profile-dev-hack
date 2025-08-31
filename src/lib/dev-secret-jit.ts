export const _dev_secret_jit = (filename: string): string => {
	if (typeof window !== 'undefined') {
		throw new Error('`_dev_secret_jit` must be invoked on the server only')
	}

	if (process.env.NODE_ENV !== 'development') {
		throw new Error('`_dev_secret_jit` must be invoked on the server only')
	}

	const fs = require('node:fs') as typeof import('node:fs')
	const path = require('node:path') as typeof import('node:path')
	const crypto = require('node:crypto') as typeof import('node:crypto')

	const filePath = path.join(process.cwd(), filename)

	const generateRandomSecret = (length = 64): string => {
		const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
		const bytes = crypto.randomBytes(length * 2)
		let secret = ''
		const max = Math.floor(256 / charset.length) * charset.length
		for (let i = 0; secret.length < length && i < bytes.length; i++) {
			const value = bytes[i]
			if (value < max) {
				secret += charset[value % charset.length]
			}
		}
		return secret.length >= length ? secret : secret + generateRandomSecret(length - secret.length)
	}

	try {
		if (fs.existsSync(filePath)) {
			const existing = fs.readFileSync(filePath, 'utf8').trim()
			if (existing.length > 0) return existing
			const regenerated = generateRandomSecret()
			fs.writeFileSync(filePath, regenerated + '\n', { encoding: 'utf8', mode: 0o600 })
			return regenerated
		}

		const secret = generateRandomSecret()
		fs.writeFileSync(filePath, secret + '\n', { encoding: 'utf8', mode: 0o600, flag: 'w' })
		return secret
	} catch (err) {
		const message = (err as Error)?.message ?? 'Unknown error'
		throw new Error(`Failed to handle ${filename}: ${message}`)
	}
}


