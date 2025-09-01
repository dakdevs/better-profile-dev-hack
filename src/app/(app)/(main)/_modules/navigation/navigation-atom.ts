import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

const navigationStateAtom = atomWithStorage('navigation-state', false)

export default function useNavigationState() {
	return useAtom(navigationStateAtom)
}
