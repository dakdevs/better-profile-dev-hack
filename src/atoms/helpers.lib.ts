// ~/src/atoms/helpers.lib.ts

import { atom, WritableAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export function atomWithToggleAndStorage(
	...params: Parameters<typeof atomWithStorage>
): WritableAtom<boolean, [boolean?], void> {
	const anAtom = atomWithStorage(...params)
	const derivedAtom = atom(
		(get) => get(anAtom),
		(get, set, nextValue?: boolean) => {
			const update = nextValue ?? !get(anAtom)
			set(anAtom, update)
		},
	)

	return derivedAtom as WritableAtom<boolean, [boolean?], void>
}
