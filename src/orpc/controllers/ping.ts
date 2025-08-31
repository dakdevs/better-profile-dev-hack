import { os } from '@orpc/server'

export default os.handler(() => {
	return { ping: 'pong' }
})
