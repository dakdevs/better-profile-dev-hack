'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@mantine/core'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import { useAppForm } from '~/form'
import { orpcClient } from '~/orpc/client'

const formSchema = z.object({
	apiKey: z.string().min(1, 'API key is required'),
})

export function ApiKeyForm({
	initialValues,
}: {
	initialValues: Partial<z.infer<typeof formSchema>>
}) {
	const router = useRouter()

	const { mutateAsync: setApiKey } = useMutation(orpcClient.recruiter.setApiKey.mutationOptions())

	const form = useAppForm({
		defaultValues: {
			apiKey: initialValues.apiKey ?? '',
		},
		onSubmit: async (data) => {
			await setApiKey({
				apiKey: data.value.apiKey,
			})
			router.refresh()
		},
		validators: {
			onSubmit: formSchema,
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
			<form.AppField name="apiKey">
				{(field) => {
					return (
						<field.PasswordField
							label="Cal.com API Key"
							description={
								<>
									{"You can find your API key in your Cal.com settings under 'API Keys' ("}
									<Link
										href="https://app.cal.com/settings/developer/api-keys"
										target="_blank"
										className="font-bold hover:underline"
									>
										{'Click Here'}
									</Link>
									{')'}
								</>
							}
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
								{'Save'}
							</Button>
						)
					}}
				</form.Subscribe>
			</div>
		</form>
	)
}
