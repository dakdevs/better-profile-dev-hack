import type { NextConfig } from 'next'
import { pipe } from 'remeda'

const nextConfig: NextConfig = {
	typedRoutes: false,
	pageExtensions: ['md', 'mdx', 'ts', 'tsx'],
	experimental: {
		reactCompiler: false,
		optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
	},
}

export default pipe(nextConfig)
