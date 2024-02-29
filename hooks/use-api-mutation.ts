import { useMutation } from 'convex/react'
import { FunctionReference } from 'convex/server'
import { useState } from 'react'

interface ApiMutationReturnType<T extends FunctionReference<'mutation'>> {
	pending: boolean
	mutate: (payload: T['_args']) => Promise<T['_returnType'] | void>
}

/**
 * 用于在对画板数据进行增删改查操作时添加 pending控制效果 限制重复/频繁点击
 */
export const useApiMutation = <Mutation extends FunctionReference<'mutation'>>(
	mutationFunction: Mutation
) => {
	const [pending, setPending] = useState(false)

	const apiMutation = useMutation(mutationFunction)

	const mutate = (payload: any) => {
		setPending(true)
		return apiMutation(payload)
			.finally(() => setPending(false))
			.then((result) => {
				return result
			})
			.catch((error) => {
				throw error
			})
	}

	return {
		mutate,
		pending,
	}
}
