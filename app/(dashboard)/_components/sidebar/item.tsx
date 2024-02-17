'use client'

import Hint from '@/components/hint'
import { cn } from '@/lib/utils'
import { useOrganization, useOrganizationList } from '@clerk/nextjs'
import Image from 'next/image'

interface ItemProps {
	id: string
	name: string
	imgUrl: string
}

const Item = ({ id, name, imgUrl }: ItemProps) => {
	const { organization } = useOrganization()

	const { setActive } = useOrganizationList()

	const onClick = () => {
		if (!setActive) return
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
