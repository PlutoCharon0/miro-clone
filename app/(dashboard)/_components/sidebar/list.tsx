'use client'

import { useOrganizationList } from '@clerk/nextjs'
import Item from './item'

// 组织展示列表组件
const List = () => {
	// 调用API  useOrganizationList 获取组织数据
	const { userMemberships } = useOrganizationList({
		userMemberships: {
			infinite: true,
		},
	})

	if (!userMemberships.data?.length) return null

	return (
		<ul className='space-y-4'>
			{userMemberships.data?.map((mem) => (
				<Item
					key={mem.organization.id}
					id={mem.organization.id}
					name={mem.organization.name}
					imgUrl={mem.organization.imageUrl}
				/>
			))}
		</ul>
	)
}

export default List
