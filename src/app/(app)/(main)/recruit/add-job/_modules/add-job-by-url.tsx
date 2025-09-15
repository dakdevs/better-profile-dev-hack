'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import { useAppForm } from '~/form'
import { orpcClient } from '~/orpc/client'

const formSchema = z.object({
	jobUrl: z.string().min(1, 'Job URL is required'),
})

export function AddJobByUrlForm() {
	const router = useRouter()

	const { mutateAsync: addJob } = useMutation(orpcClient.recruiter.addJob.mutationOptions())

	const form = useAppForm({
		defaultValues: {
			jobUrl: '',
		},
		onSubmit: async (data) => {
			await addJob({
				type: 'url',
				jobUrl: data.value.jobUrl,
			})
			router.push('/recruit')
		},
	})

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault()
				event.stopPropagation()
				void form.handleSubmit()
			}}
			className="gap-md grid max-w-4xl"
		>
			<form.AppField name="jobUrl">
				{(field) => {
					return (
						<field.InputField
							label="Job URL"
							description="We currently only support Greenhouse job urls."
						/>
					)
				}}
			</form.AppField>
			<div>
				<form.Subscribe
					selector={(state) => ({
						canSubmit:
							state.canSubmit
							&& !state.isSubmitting
							&& state.isFormValid
							&& state.isDirty
							&& state.isValid,
						isSubmitting: state.isSubmitting,
					})}
				>
					{({ canSubmit, isSubmitting }) => {
						return (
							<Button
								type="submit"
								disabled={!canSubmit}
								className="shrink-0"
								loading={isSubmitting}
							>
								{'Add Job'}
							</Button>
						)
					}}
				</form.Subscribe>
			</div>
		</form>
	)
}
