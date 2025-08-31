import { call as callOrpc } from '@orpc/server'

type CallParams = Parameters<typeof callOrpc>
type Procedure = CallParams[0]
type Params = CallParams[1]
type Options = Omit<CallParams[2], 'context'>

export default async function call(procedure: Procedure, params: Params, options: Options) {
	return call(procedure, params, {
		context: {},
		...options,
	})
}
