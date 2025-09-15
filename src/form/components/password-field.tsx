import { ComponentProps } from 'react'
import { PasswordInput } from '@mantine/core'

import { useFieldContext } from '~/form'

type PasswordFieldProps = Omit<
	ComponentProps<typeof PasswordInput>,
	'value' | 'onChange' | 'onBlur' | 'error'
>

export function PasswordField(props: PasswordFieldProps) {
	const field = useFieldContext<string>()

	const errors = field.state.meta.errors as {
		message: string
	}[]

	return (
		<PasswordInput
			{...props}
			error={errors[0]?.message}
			value={field.state.value}
			onChange={(event) => {
				field.handleChange(event.target.value)
			}}
			onBlur={field.handleBlur}
		/>
	)
}
