import { createTheme, MantineColorsTuple } from '@mantine/core'

const betterIndigo: MantineColorsTuple = [
	'#eef2fb',
	'#dae0f1',
	'#b1bee5',
	'#859adb',
	'#617bd1',
	'#4b68cc',
	'#3f5fcb',
	'#324fb4',
	'#2a46a1',
	'#1e3a8a',
]

export default createTheme({
	primaryColor: 'betterIndigo',
	colors: {
		betterIndigo,
	},
	fontFamily: 'var(--font-sans), Helvetica, Arial, sans-serif',
})
