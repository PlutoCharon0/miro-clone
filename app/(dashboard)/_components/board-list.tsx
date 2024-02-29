'use client'

import { api } from '@/convex/_generated/api'
import { useQuery } from 'convex/react'

import EmptyBoards from './empty-boards'
import EmptyFavorites from './empty-favorites'
import EmptySearch from './empty-search'
import BoardCard from './board-card'
import NewBoardButton from './new-board-button'

interface BoardListProps {
	orgId: string
	query: {
		search?: string
		favorites?: string
	}
}
// 接收params参数 根据params参数的变化动态展示内容
const BoardList = ({ orgId, query }: BoardListProps) => {
	const data = useQuery(api.boards.get, { orgId, ...query })

	// 配置过渡效果
	if (!data) {
		return (
			<div>
				<h2 className='text-3xl'>
					{query.favorites ? 'Favorite boards' : 'Team boards'}
				</h2>
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10'>
					<NewBoardButton orgId={orgId} disabled />
					<BoardCard.Skeleton />
					<BoardCard.Skeleton />
					<BoardCard.Skeleton />
					<BoardCard.Skeleton />
				</div>
			</div>
		)
	}
	// 根据不同的操作需求页 显示对应的空内容展示
	if (!data?.length && query.search) {
		return <EmptySearch />
	}
	if (!data?.length && query.favorites) {
		return <EmptyFavorites />
	}
	if (!data?.length) {
		return <EmptyBoards />
	}

	return (
		<div>
			<h2 className='text-3xl'>
				{query.favorites ? 'Favorite boards' : 'Team boards'}
			</h2>
			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10'>
				<NewBoardButton orgId={orgId} />
				{data?.map((board) => (
					<BoardCard
						key={board._id}
						id={board._id}
						title={board.title}
						imageUrl={board.imageUrl}
						authorId={board.authorId}
						authorName={board.authorName}
						createdAt={board._creationTime}
						orgId={board.orgId}
						isFavorite={board.isFavorite}
					/>
				))}
			</div>
		</div>
	)
}

export default BoardList
