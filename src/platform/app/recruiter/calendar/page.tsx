import { CalendarIntegration } from './_modules/calendar-integration'
import { CalendarView } from './_modules/calendar-view'

export default function CalendarPage() {
	return (
		<div className="space-y-8">
			<div>
				<h1 className="mb-2 text-3xl font-semibold text-black dark:text-white">
					Interview Calendar
				</h1>
				<p className="text-gray-600 dark:text-gray-400">
					Manage your interview schedule and sync with Google Calendar
				</p>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<CalendarView />
				</div>
				<div>
					<CalendarIntegration />
				</div>
			</div>
		</div>
	)
}
