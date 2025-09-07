'use client'

import { Reply } from 'lucide-react'
import z from 'zod'

import { useAppForm } from '~/form'

const formSchema = z.object({
	message: z.string().min(1, 'Message cannot be empty'),
})

export default function ChatInput({
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
			<div className="focus-within:ring-better-indigo flex h-24 w-full items-end rounded-xl ring ring-neutral-300 focus-within:ring-2">
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
								placeholder="Type your reply..."
								className="p-md h-full flex-1 resize-none outline-none"
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
							<div className="p-xs h-full">
								<button
									aria-disabled={
										isLoading || isSubmitting || isPristine || !isTouched || !canSubmit || isEmpty
									}
									type="submit"
									className="gap-sm p-md bg-better-indigo aria-disabled:bg-better-indigo-400 flex h-full items-end rounded-xl text-white"
								>
									<span>Reply</span>
									<Reply />
								</button>
							</div>
						)
					}}
				</form.Subscribe>
			</div>
		</form>
	)
}
