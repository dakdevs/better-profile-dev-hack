export default function SettingsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Settings</h1>
				<p className="mt-2 text-gray-600">Manage your account settings and preferences.</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
						<h2 className="mb-4 text-lg font-semibold text-gray-900">Account Information</h2>
						<div className="space-y-4">
							<div>
								<label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
								<input
									type="text"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
									placeholder="Enter your full name"
								/>
							</div>
							<div>
								<label className="mb-1 block text-sm font-medium text-gray-700">
									Email Address
								</label>
								<input
									type="email"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
									placeholder="Enter your email"
								/>
							</div>
							<div className="pt-4">
								<button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
									Save Changes
								</button>
							</div>
						</div>
					</div>
				</div>

				<div>
					<div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
						<h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Settings</h2>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-700">Email Notifications</span>
								<button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
									<span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition-transform" />
								</button>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-700">Push Notifications</span>
								<button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
									<span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white transition-transform" />
								</button>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-gray-700">Dark Mode</span>
								<button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
									<span className="inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white transition-transform" />
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
