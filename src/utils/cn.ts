import { cx } from 'classix'
import { twMerge } from 'tailwind-merge'

type Argument = string | boolean | null | undefined

export const cn = (...inputs: Argument[]) => {
	return twMerge(cx(...inputs))
}
