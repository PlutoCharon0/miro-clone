'use client'

import qs from 'query-string'
import { ChangeEvent, useEffect, useState } from 'react'
import { useDebounceValue } from 'usehooks-ts'
import { useRouter } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

const SearchInput = () => {
	// 获取路由操作对象
	const router = useRouter()
	// 存储input值
	const [value, set_value] = useState('')
	// 配置值的使用防抖  当用户输入值搜索时,利用防抖减少路由参数的变化
	const [debouncedValue, setValue] = useDebounceValue(value, 500)

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value)
		set_value(e.target.value)
	}

	// 用于执行副作用操作(与组件渲染无关的操作)
	useEffect(() => {
		// 当input的值发生改变 动态改变url中的query参数 并进行跳转 从而动态展示搜索的内容
		const url = qs.stringifyUrl(
			{
				url: '/',
				query: {
					search: debouncedValue,
				},
			},
			{ skipEmptyString: true, skipNull: true }
		)
		router.push(url)
	}, [debouncedValue, router])

	return (
		<div className='w-full relative'>
			<Search className='absolute top-1/2 left-3 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
			<Input
				className='w-full max-w-[516px] pl-9'
				placeholder='Search boards'
				onChange={handleChange}
				value={value}
			/>
		</div>
	)
}

export default SearchInput
