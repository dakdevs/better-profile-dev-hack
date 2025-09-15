import { getRequiredSession } from '~/lib/auth'
import { findTopJobsForUser } from '~/services/job-matching'

import MatchesList from './matches-list'

export default async function MatchesContent() {
	const session = await getRequiredSession()
	const userId = session.user.id
	const matches = await findTopJobsForUser(userId, { minMatchScore: 20, limit: 20 })

	return <MatchesList matches={matches} />
}
