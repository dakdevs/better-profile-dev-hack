// ~/src/atoms/navigation-atom.ts

import { atom, useAtom } from 'jotai'

import { atomWithToggleAndStorage } from './helpers.lib'

const navigationStateAtom = atom(false)

export function useNavigationState() {
	return useAtom(navigationStateAtom)
}

const expandNavigationAtom = atomWithToggleAndStorage('expand-navigation', true)

export function useExpandNavigation() {
	return useAtom(expandNavigationAtom)
}
