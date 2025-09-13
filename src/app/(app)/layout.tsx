import '~/orpc/orpc.server'
import '~/styles/globals.css'
import '@mantine/core/styles.css'

import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core'
import { Provider } from 'jotai'

import { isDevelopment } from '~/config/env'
import { geistMono, instrumentSans, rakkas } from '~/fonts'
import theme from '~/styles/theme'
import { cn } from '~/utils/cn'

import TanstackQueryClientProvider from './_modules/tanstack-query-client'

export const viewport: Viewport = {
	maximumScale: 1,
	colorScheme: 'only light',
	themeColor: '#fcfcfc',
}

const METADATA_TITLE = 'Better Profile'
const METADATA_DESCRIPTION =
	'Stop chasing jobs. Start attracting opportunities with Better Profile - the AI-powered career agent that conducts ongoing, conversational interviews to build a living, verifiable professional profile and tailored resumes.'

export const metadata: Metadata = {
	title: {
		default: METADATA_TITLE,
		template: `%s | ${METADATA_TITLE}`,
	},
	description: METADATA_DESCRIPTION,
}

const imagePreloads = [
	'/images/interview-banner.png',
	'/images/settings-banner-v2.png',
	'/images/matches-banner-v2.png',
	'/images/signup-bg.png',
	'/images/bg-2.png',
]

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode
}>) {
	return (
		<html
			lang="en"
			className={cn(
				instrumentSans.variable,
				geistMono.variable,
				rakkas.variable,
				'h-full touch-manipulation scroll-smooth antialiased',
			)}
			style={{
				scrollbarGutter: 'stable',
			}}
			{...mantineHtmlProps}
		>
			<head>
				<ColorSchemeScript />
				{imagePreloads.map((image) => (
					<link
						key={image}
						rel="preload"
						as="image"
						href={image}
					/>
				))}
			</head>
			<TanstackQueryClientProvider>
				<body className="h-full font-sans">
					<div className="root isolate h-full">
						<Provider>
							<MantineProvider theme={theme}>{children}</MantineProvider>
						</Provider>
					</div>
				</body>
			</TanstackQueryClientProvider>
		</html>
	)
}
