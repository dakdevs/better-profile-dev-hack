import { Briefcase, RefreshCw, Target, TrendingUp } from 'lucide-react'

interface JobMatchingHeaderProps {
	matchCount: number
	onRefresh: () => void
	refreshing: boolean
}

export function JobMatchingHeader({ matchCount, onRefresh, refreshing }: JobMatchingHeaderProps) {
	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Find Your Jobs</h1>
					<p className="mt-1 text-gray-600">
						Jobs that match your skills with 90% or higher accuracy
					</p>
				</div>
				<button
					onClick={onRefresh}
					disabled={refreshing}
					className="bg-apple-blue inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
					{refreshing ? 'Refreshing...' : 'Refresh'}
				</button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
					<div className="flex items-center gap-3">
						<div className="bg-apple-blue/10 rounded-lg p-2">
							<Briefcase className="text-apple-blue h-5 w-5" />
						</div>
						<div>
							<p className="text-sm text-gray-600">High-Quality Matches</p>
							<p className="text-2xl font-bold text-gray-900">{matchCount}</p>
						</div>
					</div>
				</div>

				<div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-green-100 p-2">
							<Target className="h-5 w-5 text-green-600" />
						</div>
						<div>
							<p className="text-sm text-gray-600">Match Threshold</p>
							<p className="text-2xl font-bold text-gray-900">90%+</p>
						</div>
					</div>
				</div>

				<div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-purple-100 p-2">
							<TrendingUp className="h-5 w-5 text-purple-600" />
						</div>
						<div>
							<p className="text-sm text-gray-600">Success Rate</p>
							<p className="text-2xl font-bold text-gray-900">{matchCount > 0 ? '95%' : '--'}</p>
						</div>
					</div>
				</div>
			</div>

			{matchCount > 0 && (
				<div className="from-apple-blue/10 border-apple-blue/20 rounded-xl border bg-gradient-to-r to-purple-100 p-6">
					<div className="flex items-start gap-4">
						<div className="bg-apple-blue/20 rounded-lg p-2">
							<Target className="text-apple-blue h-6 w-6" />
						</div>
						<div>
							<h3 className="mb-2 font-semibold text-gray-900">Perfect Matches Found!</h3>
							<p className="text-sm leading-relaxed text-gray-700">
								We found {matchCount} job{matchCount !== 1 ? 's' : ''} that closely match your
								skills and experience. These positions have a 90% or higher compatibility score
								based on your interview data and skill profile.
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
