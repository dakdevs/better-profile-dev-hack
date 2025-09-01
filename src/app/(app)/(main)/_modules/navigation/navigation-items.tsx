import { Home, Icon, Speech, SquareEqual } from 'lucide-react'

type NavigationItem = {
	label: string
	href: string
	icon: typeof Icon
}

const navigationItems = [
	{
		label: 'Home',
		href: '/',
		icon: Home,
	},
	{
		label: 'Interview',
		href: '/interview',
		icon: Speech,
	},
	{
		label: 'Matched Roles',
		href: '/matches',
		icon: SquareEqual,
	},
] satisfies NavigationItem[]

export default navigationItems
