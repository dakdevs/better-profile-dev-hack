import { atom, useAtom } from 'jotai'

const navigationStateAtom = atom(false)

export default function useNavigationState() {
	return useAtom(navigationStateAtom)
}
