interface LoadingFallbackProps {
	message?: string
	size?: 'small' | 'medium' | 'large'
	className?: string
}

export function LoadingFallback({
	message = 'Loading...',
	size = 'medium',
	className = '',
}: LoadingFallbackProps) {
	const sizeClasses = {
		small: 'w-4 h-4',
		medium: 'w-6 h-6',
		large: 'w-8 h-8',
	}

	const containerClasses = {
		small: 'p-4',
		medium: 'p-6',
		large: 'p-8',
	}

	return (
		<div className={`flex items-center justify-center ${containerClasses[size]} ${className}`}>
			<div className="text-center">
				<div
					className={`${sizeClasses[size]} border-t-apple-blue mx-auto mb-2 animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700`}
				/>
				<p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
			</div>
		</div>
	)
}

export function SkeletonCard() {
	return (
		<div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
			<div className="space-y-4">
				<div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
				<div className="space-y-2">
					<div className="h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
					<div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
				</div>
				<div className="flex space-x-2">
					<div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
					<div className="h-8 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
				</div>
			</div>
		</div>
	)
}

export function SkeletonList({ count = 3 }: { count?: number }) {
	return (
		<div className="space-y-4">
			{Array.from({ length: count }).map((_, i) => (
				<SkeletonCard key={i} />
			))}
		</div>
	)
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
	return (
		<div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-black">
			<div className="border-b border-gray-200 p-4 dark:border-gray-700">
				<div className="h-4 w-1/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
			</div>
			<div className="divide-y divide-gray-200 dark:divide-gray-700">
				{Array.from({ length: rows }).map((_, rowIndex) => (
					<div
						key={rowIndex}
						className="flex space-x-4 p-4"
					>
						{Array.from({ length: cols }).map((_, colIndex) => (
							<div
								key={colIndex}
								className={`h-3 animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${
									colIndex === 0 ? 'w-1/4' : colIndex === cols - 1 ? 'w-1/6' : 'flex-1'
								}`}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	)
}
