'use client'

import { Reply } from 'lucide-react'
import z from 'zod'

import { useAppForm } from '~/form'

const formSchema = z.object({
	message: z.string().min(1, 'Message cannot be empty'),
})

export default function ConversationInput({
	isLoading = false,
	onSubmit,
}: {
	isLoading?: boolean
	onSubmit: (message: string) => PromiseLike<void> | void
}) {
	const form = useAppForm({
		defaultValues: {
			message: '',
		},
		onSubmit: async ({ value, formApi }) => {
			formApi.reset()
			await onSubmit(value.message)
		},
		validators: {
			onSubmit: formSchema,
		},
	})

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				e.stopPropagation()
				void form.handleSubmit()
			}}
			className="mx-auto w-full max-w-5xl"
		>
			<div className="relative flex w-full flex-col rounded-3xl border border-neutral-200 bg-neutral-50 px-1 pt-2 shadow-sm">
				<form.Field name="message">
					{(field) => {
						return (
							<textarea
								id={field.name}
								name={field.name}
								value={field.state.value}
								onChange={(e) => {
									field.handleChange(e.target.value)
								}}
								placeholder="Type your message..."
								className="mb-1 max-h-32 min-h-[64px] w-full resize-none bg-transparent px-3.5 pt-1.5 pb-3 text-base outline-none placeholder:text-neutral-500"
								rows={1}
								onKeyDown={(e) => {
									if (e.key === 'Enter' && !e.shiftKey) {
										e.preventDefault()
										void form.handleSubmit()
									}
								}}
							/>
						)
					}}
				</form.Field>
				<form.Subscribe
					selector={(state) => [
						state.isSubmitting,
						state.isPristine,
						state.isTouched,
						state.canSubmit,
						state.values.message.length === 0,
					]}
				>
					{([isSubmitting, isPristine, isTouched, canSubmit, isEmpty]) => {
						return (
							<div className="relative mx-1 mt-2 mb-2 flex items-center justify-end">
								<button
									disabled={
										isLoading || isSubmitting || isPristine || !isTouched || !canSubmit || isEmpty
									}
									type="submit"
									className="bg-better-indigo hover:bg-better-indigo-600 inline-flex size-[34px] items-center justify-center rounded-full p-1 text-white shadow-sm transition-all disabled:bg-neutral-300 disabled:text-neutral-500"
								>
									<Reply className="size-5" />
								</button>
							</div>
						)
					}}
				</form.Subscribe>
			</div>
		</form>
	)
}
