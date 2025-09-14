import { Cog, Home, Speech, SquareEqual, Users, type LucideIcon } from 'lucide-react'

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
		label: 'My Interview',
		href: '/interview',
		icon: Speech,
	},
	{
		label: 'Matched Roles',
		href: '/matches',
		icon: SquareEqual,
	},
	{
		label: 'Recruit',
		href: '/recruit',
		icon: Users,
	},
] satisfies NavigationItem[]

export const accountNavigationItems = [
	{
		label: 'Settings',
		href: '/settings',
		icon: Cog,
	},
] satisfies NavigationItem[]
