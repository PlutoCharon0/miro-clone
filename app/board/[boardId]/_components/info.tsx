'use client'

import { cn } from '@/lib/utils'
import { Id } from '@/convex/_generated/dataModel'
import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'
import { useRenameModal } from '@/store/use-rename-moadl'

import Image from 'next/image'
import Link from 'next/link'
import Hint from '@/components/hint'
import Actions from '@/components/actions'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface InfoProps {
	boardId: string
}

const TabSeparator = () => {
	return <div className='text-neutral-300 px-1.5'>|</div>
}

const Info = ({ boardId }: InfoProps) => {
	const { onOpen } = useRenameModal()

	const data = useQuery(api.board.get, {
		id: boardId as Id<'boards'>,
	})

	if (!data) return <InfoSkeleton></InfoSkeleton>

	return (
		<div className='absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md'>
			<Hint label='Go to Boards' side='bottom' sideOffset={10}>
				<Button className='px-2' variant='board' asChild>
					<Link href='/'>
						<Image src='/logo.svg' alt='Board Logo' height={40} width={40} />
						<span
							className={cn(
								'font-semibold text-xl ml-2 text-black',
								'font-Poppins'
							)}>
							Board
						</span>
					</Link>
				</Button>
			</Hint>
			<TabSeparator />
			<Hint label='Edit title' side='bottom' sideOffset={10}>
				<Button
					variant='board'
					className='text-base font-normal px-2'
					onClick={() => onOpen(data._id, data.title)}>
					{data.title}
				</Button>
			</Hint>
			<TabSeparator />
			<Actions id={data._id} title={data.title} side='bottom' sideOffset={10}>
				<div>
					<Hint label='Main menu' side='bottom' sideOffset={10}>
						<Button size='icon' variant='board'>
							<Menu />
						</Button>
					</Hint>
				</div>
			</Actions>
		</div>
	)
}

export const InfoSkeleton = () => {
	return (
		<div className='absolute top-2 left-2 bg-white rounded-md px-1.5 h-12 flex items-center shadow-md w-[300px]'></div>
	)
}

export default Info
