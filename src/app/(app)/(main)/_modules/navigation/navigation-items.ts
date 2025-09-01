import { Cog, Home, Speech, SquareEqual, type LucideIcon } from 'lucide-react'

type NavigationItem = {
	label: string
	href: string
	icon: LucideIcon
}

export const mainNavigationItems = [
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

export const accountNavigationItems = [
	{
		label: 'Settings',
		href: '/settings',
		icon: Cog,
	},
] satisfies NavigationItem[]
