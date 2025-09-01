import { atom, useAtom, WritableAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

const navigationStateAtom = atom(false)

export function useNavigationState() {
	return useAtom(navigationStateAtom)
}

const expandNavigationAtom = atomWithToggleAndStorage('expand-navigation', true)

export function useExpandNavigation() {
	return useAtom(expandNavigationAtom)
}

function atomWithToggleAndStorage(
	key: string,
	initialValue?: boolean,
	storage?: any,
): WritableAtom<boolean, [boolean?], void> {
	const anAtom = atomWithStorage(key, initialValue, storage)
	const derivedAtom = atom(
		(get) => get(anAtom),
		(get, set, nextValue?: boolean) => {
			const update = nextValue ?? !get(anAtom)
			void set(anAtom, update)
		},
	)

	return derivedAtom as WritableAtom<boolean, [boolean?], void>
}
