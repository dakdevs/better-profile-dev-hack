import { Middleware } from '@orpc/server'

export type GetOutputContext<T> =
	T extends Middleware<any, infer OutContext, any, any, any, any> ? OutContext : never
