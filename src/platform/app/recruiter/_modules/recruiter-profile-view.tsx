'use client'

import { RecruiterProfile } from '~/types/interview-management'

interface RecruiterProfileViewProps {
	profile: RecruiterProfile
	onEdit?: () => void
	onDelete?: () => void
	isLoading?: boolean
}

export function RecruiterProfileView({
	profile,
	onEdit,
	onDelete,
	isLoading = false,
}: RecruiterProfileViewProps) {
	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(date)
	}

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
			{/* Header */}
			<div className="mb-6 flex items-start justify-between">
				<div>
					<h2 className="mb-1 text-xl font-semibold text-black dark:text-white">
						Recruiter Profile
					</h2>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Your recruiting information and contact details
					</p>
				</div>

				{(onEdit || onDelete) && (
					<div className="flex gap-2">
						{onEdit && (
							<button
								onClick={onEdit}
								disabled={isLoading}
								className="bg-apple-blue font-system focus-visible:outline-apple-blue disabled:hover:bg-apple-blue min-h-[44px] rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-150 ease-out outline-none hover:-translate-y-px hover:bg-[#0056CC] focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-y-0 active:bg-[#004499] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
							>
								Edit Profile
							</button>
						)}

						{onDelete && (
							<button
								onClick={onDelete}
								disabled={isLoading}
								className="bg-apple-red font-system focus-visible:outline-apple-red disabled:hover:bg-apple-red min-h-[44px] rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-150 ease-out outline-none hover:-translate-y-px hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-y-0 active:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
							>
								Delete Profile
							</button>
						)}
					</div>
				)}
			</div>

			{/* Profile Information */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{/* Organization Name */}
				<div>
					<label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
						Organization Name
					</label>
					<p className="text-base font-medium text-black dark:text-white">
						{profile.organizationName}
					</p>
				</div>

				{/* Recruiting For */}
				<div>
					<label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
						Recruiting For
					</label>
					<p className="text-base font-medium text-black dark:text-white">
						{profile.recruitingFor}
					</p>
				</div>

				{/* Contact Email */}
				<div>
					<label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
						Contact Email
					</label>
					{profile.contactEmail ? (
						<a
							href={`mailto:${profile.contactEmail}`}
							className="text-apple-blue text-base underline transition-colors duration-150 hover:text-blue-600"
						>
							{profile.contactEmail}
						</a>
					) : (
						<p className="text-base text-gray-400 italic dark:text-gray-500">Not provided</p>
					)}
				</div>

				{/* Phone Number */}
				<div>
					<label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
						Phone Number
					</label>
					{profile.phoneNumber ? (
						<a
							href={`tel:${profile.phoneNumber}`}
							className="text-apple-blue text-base underline transition-colors duration-150 hover:text-blue-600"
						>
							{profile.phoneNumber}
						</a>
					) : (
						<p className="text-base text-gray-400 italic dark:text-gray-500">Not provided</p>
					)}
				</div>

				{/* Timezone */}
				<div>
					<label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
						Timezone
					</label>
					<p className="text-base font-medium text-black dark:text-white">{profile.timezone}</p>
				</div>

				{/* Profile ID */}
				<div>
					<label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
						Profile ID
					</label>
					<p className="font-mono text-base text-sm text-gray-500 dark:text-gray-400">
						{profile.id}
					</p>
				</div>
			</div>

			{/* Metadata */}
			<div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					<div>
						<label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
							Created
						</label>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{formatDate(profile.createdAt)}
						</p>
					</div>

					<div>
						<label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
							Last Updated
						</label>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{formatDate(profile.updatedAt)}
						</p>
					</div>
				</div>
			</div>

			{/* Profile Status Indicator */}
			<div className="mt-6 flex items-center gap-2">
				<div className="bg-apple-green h-2 w-2 rounded-full"></div>
				<span className="text-sm text-gray-600 dark:text-gray-400">
					Profile is active and visible to candidates
				</span>
			</div>
		</div>
	)
}
