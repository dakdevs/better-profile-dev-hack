import { createFormHook, createFormHookContexts } from '@tanstack/react-form'

import { InputField } from './components/input-field'
import { PasswordField } from './components/password-field'

export const { fieldContext, formContext, useFieldContext } = createFormHookContexts()

export const { useAppForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {
		InputField,
		PasswordField,
	},
	formComponents: {},
})
