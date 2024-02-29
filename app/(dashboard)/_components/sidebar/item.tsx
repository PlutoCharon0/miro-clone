'use client'

import { cn } from '@/lib/utils'
import { useOrganization, useOrganizationList } from '@clerk/nextjs'

import Image from 'next/image'
import Hint from '@/components/hint'

interface ItemProps {
	id: string
	name: string
	imgUrl: string
}

const Item = ({ id, name, imgUrl }: ItemProps) => {
	// 获取当前用户所处的组织信息数据
	const { organization } = useOrganization()
	// 解构出用于将组织设置为活动状态的函数
	const { setActive } = useOrganizationList()

	const onClick = () => {
		if (!setActive) return
		// 设置当前处于活动状态的组织
		setActive({ organization: id })
	}

	const isActive = organization?.id === id
	
	return (
		<div className='aspect-square relative'>
			<Hint label={name} side='right' align='start' sideOffset={18}>
				<Image
					alt={name}
					src={imgUrl}
					width={36}
					height={36}
					onClick={onClick}
					className={cn(
						'rounded-md cursor-pointer opacity-75 hover:opacity-100 transition',
						isActive && 'opacity-100'
					)}
				/>
			</Hint>
		</div>
	)
}

export default Item
