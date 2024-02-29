'use client'

import { useAuth } from '@clerk/nextjs'
import { formatDistanceToNow } from 'date-fns'
import { useApiMutation } from '@/hooks/use-api-mutation'
import { api } from '@/convex/_generated/api'
import { toast } from 'sonner'

import Overlay from './overlay'
import Image from 'next/image'
import Link from 'next/link'
import Footer from './footer'
import Actions from '@/components/actions'
import { Skeleton } from '@/components/ui/skeleton'
import { MoreHorizontal } from 'lucide-react'

interface BoardCardProps {
	id: string
	title: string
	authorName: string
	authorId: string
	createdAt: number
	imageUrl: string
	orgId: string
	isFavorite: boolean
}

const BoardCard = ({
	id,
	title,
	authorId,
	authorName,
	createdAt,
	imageUrl,
	orgId,
	isFavorite,
}: BoardCardProps) => {
	// 获取当前用户的id
	const { userId } = useAuth()

	// 配置用户名称 和 距今创建日期
	const authoLabel = userId === authorId ? 'You' : authorName
	const createdAtLabel = formatDistanceToNow(createdAt, {
		addSuffix: true,
	})

	const { mutate: onFavorite, pending: pengdingFavorite } = useApiMutation(
		api.board.favorite
	)
	const { mutate: onUnfavorite, pending: pendingUnfavorite } = useApiMutation(
		api.board.unfavorite
	)

	const toggleFavorite = () => {
		if (isFavorite) {
			onUnfavorite({ id }).catch(() => toast.error('Failed to unfavorite'))
		} else {
			onFavorite({ id, orgId }).catch(() => toast.error('Failed to favorite'))
		}
	}

	return (
		<Link href={`board/${id}`}>
			<div className='group aspect-[100/127] border rounded-lg flex flex-col justify-between overflow-hidden'>
				<div className='relative flex-1 bg-amber-50'>
					<Image src={imageUrl} alt={title} fill className='object-fit' />
					<Overlay />
					<Actions id={id} title={title} side='right'>
						<button className='absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-2 outline-none'>
							<MoreHorizontal className='text-white opacity-75 hover:opacity-100 transition-opacity' />
						</button>
					</Actions>
				</div>
				<Footer
					isFavorite={isFavorite}
					title={title}
					authorLabel={authoLabel}
					createdAtLabel={createdAtLabel}
					onClick={toggleFavorite}
					disabled={pengdingFavorite || pendingUnfavorite}
				/>
			</div>
		</Link>
	)
}

export default BoardCard

BoardCard.Skeleton = function BoardCardSkeleton() {
	return (
		<div className=' aspect-[100/127]  rounded-lg overflow-hidden'>
			<Skeleton className='h-full w-full' />
		</div>
	)
}
