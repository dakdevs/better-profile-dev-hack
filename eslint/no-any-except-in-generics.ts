/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import { TSESTree } from '@typescript-eslint/types'
import { ESLintUtils } from '@typescript-eslint/utils'

const createRule = ESLintUtils.RuleCreator((name) => `https://example.com/rule-docs/${name}`)

type MessageIds = 'noAny'
type Options = []

export const noAnyExceptInGenerics = createRule<Options, MessageIds>({
	name: 'no-any-except-in-generics',
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow `any` except when used inside generics (type arguments or type parameter defaults/constraints).',
		},
		messages: {
			noAny:
				'Unexpected `any`. Only allowed inside generics (e.g., `Foo<any>`, `<T = any>`, or `<T extends any>`).',
		},
		schema: [],
	},
	defaultOptions: [],
	create(context) {
		function isAllowedGenericContext(node: TSESTree.TSAnyKeyword): boolean {
			let cur = node.parent as TSESTree.Node | undefined

			while (cur) {
				const nodeType = (cur as TSESTree.Node).type

				// Allowed when `any` is used as a generic type argument: Foo<any>
				if (nodeType === 'TSTypeParameterInstantiation') return true

				// Allowed inside a generic type parameter declaration
				// e.g. function f<T = any>() or interface X<T extends any> {}
				if (nodeType === 'TSTypeParameter') return true

				// Stop climbing once we exit the type position where "generic-ness" would be relevant
				// If we hit a function decl, variable decl, or top-level program without finding an allowed ancestor, bail.
				if (
					nodeType === 'Program'
					|| nodeType === 'VariableDeclarator'
					|| nodeType === 'TSTypeAnnotation'
					|| nodeType === 'FunctionDeclaration'
					|| nodeType === 'ArrowFunctionExpression'
					|| nodeType === 'FunctionExpression'
				) {
					break
				}

				cur = (cur as TSESTree.Node).parent
			}
			return false
		}

		return {
			TSAnyKeyword(node) {
				if (!isAllowedGenericContext(node)) {
					context.report({ node, messageId: 'noAny' })
				}
			},
		}
	},
})
