import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.SKIP_ENV_VALIDATION = '1'
process.env.NODE_ENV = 'development'
process.env.DATABASE_URL = process.env.DATABASE_URL
	|| 'postgresql://betterprofile:betterprofile@localhost:5432/betterprofile'
process.env.OPENAI_API_KEY = 'test-api-key'
process.env.BETTER_AUTH_SECRET = 'test-secret'
process.env.GOOGLE_CLIENT_ID = 'test-client-id'
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret'
process.env.NEXT_PUBLIC_CAL_OAUTH_CLIENT_ID = 'test-cal-oauth-client-id'
process.env.OPENROUTER_API_KEY = 'test-openrouter-key'
process.env.CAL_OAUTH_CLIENT_SECRET = 'test-cal-oauth-client-secret'
process.env.CALCOM_ORGANIZATION_ID = 'test-calcom-org-id'
process.env.SUPERMEMORY_KEY = 'test-supermemory-key'
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
