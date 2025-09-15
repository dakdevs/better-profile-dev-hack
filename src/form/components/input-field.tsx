import { ComponentProps } from 'react'
import { TextInput } from '@mantine/core'

import { useFieldContext } from '~/form'

type InputFieldProps = Omit<
	ComponentProps<typeof TextInput>,
	'value' | 'onChange' | 'onBlur' | 'error'
>

export function InputField(props: InputFieldProps) {
	const field = useFieldContext<string>()

	const errors = field.state.meta.errors as {
		message: string
	}[]

	const { label, description, ...inputProps } = props

	return (
		<TextInput
			{...inputProps}
			error={errors[0]?.message}
			value={field.state.value}
			onChange={(event) => {
				field.handleChange(event.target.value)
			}}
			onBlur={field.handleBlur}
		/>
	)
}
