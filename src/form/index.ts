import { createFormHook, createFormHookContexts } from '@tanstack/react-form'
import z from 'zod'

export const { fieldContext, formContext, useFieldContext } = createFormHookContexts()

export const { useAppForm } = createFormHook({
	fieldContext,
	formContext,
	fieldComponents: {},
	formComponents: {},
})

type UseAppFormOptions = Parameters<typeof useAppForm>[0]

type BaseOnSubmitArg = UseAppFormOptions extends { onSubmit?: (arg: infer P) => unknown }
	? P
	: never

export function useSchemaAppForm<TSchema extends z.ZodType>(
	opts: Omit<UseAppFormOptions, 'validators' | 'defaultValues' | 'onSubmit'> & {
		schema: TSchema
		defaultValues: z.input<TSchema>
		enableValidationOnChange?: boolean
		enableValidationOnBlur?: boolean
		validators?: Partial<{ onChange: TSchema; onSubmit: TSchema; onBlur: TSchema }>
		onSubmit?: (args: Omit<BaseOnSubmitArg, 'value'> & { value: z.input<TSchema> }) => unknown
	},
) {
	const {
		schema,
		validators,
		defaultValues,
		onSubmit,
		enableValidationOnChange = false,
		enableValidationOnBlur = false,
		...rest
	} = opts

	return useAppForm({
		...rest,
		defaultValues,
		validators: {
			onSubmit: onSubmit ? (validators?.onSubmit ?? schema) : undefined,
			onChange: enableValidationOnChange ? (validators?.onChange ?? schema) : undefined,
			onBlur: enableValidationOnBlur ? (validators?.onBlur ?? schema) : undefined,
			...validators,
		},
		onSubmit: onSubmit
			? (args: BaseOnSubmitArg) =>
					onSubmit({ ...args, value: args.value } as unknown as Omit<BaseOnSubmitArg, 'value'> & {
						value: z.input<TSchema>
					})
			: undefined,
	})
}

export function handleFormSubmit(form: ReturnType<typeof useSchemaAppForm>) {
	return (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		e.stopPropagation()
		void form.handleSubmit()
	}
}
