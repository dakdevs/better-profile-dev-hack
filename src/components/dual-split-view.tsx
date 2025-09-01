import type { ReactNode } from 'react'

export function DualSplitView({ left, right }: { left: ReactNode; right: ReactNode }) {
	return (
		<div className="grid size-full grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1">
			<div className="flex-1">{left}</div>
			<div className="flex-1">{right}</div>
		</div>
	)
}
