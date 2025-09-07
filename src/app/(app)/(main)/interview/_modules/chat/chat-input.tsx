'use client'

import { Reply } from 'lucide-react'
import z from 'zod'

import { handleFormSubmit, useAppForm } from '~/form'

const formSchema = z.object({
	message: z.string().min(1, 'Message cannot be empty'),
})

export default function ChatInput({ onSubmit }: { onSubmit: (message: string) => Promise<void> }) {
	const form = useAppForm({
		defaultValues: {
			message: '',
		},
		onSubmit: async ({ value }) => {
			await onSubmit(value.message)
		},
		validators: {
			onSubmit: formSchema,
		},
	})

	return (
		<form
			onSubmit={handleFormSubmit(form)}
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
									aria-disabled={isSubmitting || isPristine || !isTouched || !canSubmit || isEmpty}
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
