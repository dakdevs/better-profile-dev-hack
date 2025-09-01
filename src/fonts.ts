import { Instrument_Sans, Rakkas } from 'next/font/google'
import { GeistMono } from 'geist/font/mono'

export const instrumentSans = Instrument_Sans({
	variable: '--font-instrument-sans',
	subsets: ['latin'],
	display: 'block',
})

export const geistMono = GeistMono

export const rakkas = Rakkas({
	variable: '--font-rakkas-font',
	weight: '400',
	subsets: ['latin'],
})
