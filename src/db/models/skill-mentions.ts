import { relations } from 'drizzle-orm'
import { bigserial, pgTable, text, uuid } from 'drizzle-orm/pg-core'

import { interviewMessages } from '~/db/models/interview-messages'
import { userSkills } from '~/db/models/user-skills'
import { users } from '~/db/models/users'
import { timestamps } from '~/db/utils'

export const skillMentions = pgTable('skill_mentions', {
	id: bigserial('id', { mode: 'number' }).primaryKey(),
	userSkillId: uuid('user_skill_id')
		.notNull()
		.references(
			() => {
				return userSkills.id
			},
			{ onDelete: 'cascade' },
		),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }), // Changed to uuid
	messageId: uuid('message_id')
		.notNull()
		.references(() => {
			return interviewMessages.id
		}),
	mentionText: text('mention_text'),
	confidence: text('confidence'),
	engagementLevel: text('engagement_level'),
	topicDepth: text('topic_depth'),
	conversationContext: text('conversation_context'),
	...timestamps,
})

export const skillMentionRelations = relations(skillMentions, ({ one }) => {
	return {
		userSkill: one(userSkills, {
			fields: [skillMentions.userSkillId],
			references: [userSkills.id],
		}),
		user: one(users, {
			fields: [skillMentions.userId],
			references: [users.id],
		}),
		interviewMessage: one(interviewMessages, {
			fields: [skillMentions.messageId],
			references: [interviewMessages.id],
		}),
	}
})
