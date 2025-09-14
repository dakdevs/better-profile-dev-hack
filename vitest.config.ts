import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		globals: true,
<<<<<<< HEAD
		
		// Coverage configuration
		coverage: {
			provider: 'v8',
			reporter: ['text', 'text-summary', 'html', 'json'],
			reportsDirectory: './coverage',
			exclude: [
				'node_modules/',
				'src/test/',
				'**/*.d.ts',
				'**/*.config.*',
				'**/coverage/**',
				'**/dist/**',
				'**/.next/**'
			],
			thresholds: {
				global: {
					branches: 70,
					functions: 70,
					lines: 70,
					statements: 70
				}
			}
		},
		
		// Test timeout
		testTimeout: 10000,
		
		// Environment variables for tests
		env: {
			NODE_ENV: 'test',
			OPENROUTER_API_KEY: 'test-key',
			CAL_COM_API_KEY: 'test-cal-key',
			BETTER_AUTH_SECRET: 'test-secret',
			GOOGLE_CLIENT_ID: 'test-client-id',
			GOOGLE_CLIENT_SECRET: 'test-client-secret'
		}
=======
>>>>>>> production
	},
	resolve: {
		alias: {
			'~': resolve(__dirname, './src'),
		},
	},
})
