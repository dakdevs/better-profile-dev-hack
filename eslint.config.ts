import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import tseslint from 'typescript-eslint'

import { noAnyExceptInGenerics } from './eslint/no-any-except-in-generics'

// -----------------------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// FlatCompat lets us continue to consume configs that have not yet migrated to the
// new flat-config format (for example `eslint-config-next`).
const compat = new FlatCompat({
	baseDirectory: __dirname,
})

// -----------------------------------------------------------------------------------------
// Export the flat config array using the `typescript-eslint` helper. This automatically
// wires up the correct parser/plugin and exposes the `strictTypeChecked` preset.
// -----------------------------------------------------------------------------------------
export default tseslint.config(
	// Global ignores
	{
		ignores: [
			'node_modules/**',
			'.next/**',
			'out/**',
			'build/**',
			'next-env.d.ts',
			'**/dist',
			'**/*.js',
			'src/payload/generated/**/*',
		],
	},

	// Base JavaScript rules.
	js.configs.recommended,

	// Next.js + Prettier (converted via `FlatCompat`). The spread keeps the correct order.
	...compat.extends('next', 'next/core-web-vitals', 'prettier'),

	// TypeScript rules – start with the recommended set and then enable the strict
	// type-checked variant which performs full program-level analysis.
	...tseslint.configs.recommended,
	...tseslint.configs.strictTypeChecked,

	// Disable strict type checking for custom ESLint rules
	{
		files: ['eslint/**/*.ts'],
		rules: {
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/restrict-template-expressions': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
		},
	},

	// Provide project-aware parsing so that the strict presets have full type info.
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: __dirname,
			},
		},
	},

	// Prettier plugin + our opinionated overrides.
	{
		plugins: {
			prettier: eslintPluginPrettier,
			'local-rules': { rules: { 'no-any-except-in-generics': noAnyExceptInGenerics } },
		},
		rules: {
			'prettier/prettier': 'error',

			// ----------------------------------------------------------------------
			// Existing project-specific rule tweaks
			// ----------------------------------------------------------------------
			camelcase: 'off',
			'import/prefer-default-export': 'off',
			'react/jsx-filename-extension': 'off',
			'react/jsx-no-literals': 'error',
			'react/jsx-curly-brace-presence': [
				'error',
				{
					children: 'always',
				},
			],
			'react/jsx-props-no-spreading': 'off',
			'react/no-unused-prop-types': 'off',
			'react/require-default-props': 'off',
			'react/no-unescaped-entities': 'off',
			'import/extensions': [
				'error',
				'ignorePackages',
				{
					ts: 'never',
					tsx: 'never',
					js: 'never',
					jsx: 'never',
				},
			],

			// Align with previous configuration – soften a few rules that are too strict
			'no-use-before-define': 'off',
			'@typescript-eslint/no-var-requires': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/no-misused-promises': [
				'error',
				{
					checksVoidReturn: false,
				},
			],
			'@typescript-eslint/no-use-before-define': [
				'error',
				{
					functions: false,
				},
			],

			// TypeScript-specific relaxations
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
			'local-rules/no-any-except-in-generics': 'error',
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},

	tseslint.config({
		files: ['src/**/*.lib.ts', 'src/**/*.lib.tsx'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
		},
	}),

	eslintConfigPrettier,

	// Custom configs
	tseslint.config({
		files: ['src/**/*.ts', 'src/**/*.tsx'],
		ignores: ['src/**/*.dts.ts', 'src/**/*.dts.tsx'],
		rules: {
			'no-restricted-globals': [
				'warn',
				{
					name: 'React',
					message: "import type { ReactNode } from 'react'",
				},
			],
			'no-restricted-imports': [
				'error',
				{
					paths: [
						{
							name: 'react',
							importNames: ['default'],
							message:
								'Please do not import the default React import. React 17+ no longer requires React to be in scope when using JSX. Destructure a named export if you need a specific export.',
						},
					],
				},
			],
			'no-restricted-syntax': [
				'error',
				{
					selector:
						"BinaryExpression[left.type='MemberExpression'][left.object.type='MemberExpression'][left.object.object.name='process'][left.object.property.name='env'][left.property.name='NODE_ENV'][operator='==='][right.type='Literal'][right.value='production']",
					message: 'Please do not create caveats for production only.',
				},
				{
					selector:
						"BinaryExpression[left.type='Identifier'][left.name='NODE_ENV'][operator='==='][right.type='Literal'][right.value='production']",
					message: 'Please do not create caveats for production only.',
				},
			],
		},
	}),
	tseslint.config({
		files: ['src/**/*.ts', 'src/**/*.tsx'],
		ignores: [
			'src/lib/**/*.ts',
			'src/lib/**/*.tsx',
			'src/**/*.dts.ts',
			'src/**/*.dts.tsx',
			'src/payload/blocks/**/*.ts',
			'src/payload/blocks/**/*.tsx',
			'src/**/*.lib.ts',
			'src/**/*.lib.tsx',
		],
		rules: {
			'no-restricted-syntax': [
				'error',
				{
					selector: "ExportNamedDeclaration[exportKind='interface']",
					message:
						'Generally exporting interfaces in non-library code is an anti-pattern because it causes complex dependencies between downstream interfaces.',
				},
				{
					selector: "ExportNamedDeclaration[exportKind='type']",
					message:
						'Generally exporting types in non-library code is an anti-pattern because it causes complex dependencies between downstream interfaces.',
				},
			],
		},
	}),
)
