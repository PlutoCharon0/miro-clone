'use client'

import { connectionIdToColor } from '@/lib/utils'
import { useOthers, useSelf } from '@/liveblocks.config'

import UserAvatar from './user-avatar'

// 表示在组件中最多显示多少个用户的头像，默认值为2。
const MAX_SHOWN_USERS = 2

const Participants = () => {
	// 获取当前操作画板的其他用户
	const users = useOthers()
	// 获取当前操作画板的用户
	const currentUser = useSelf()

	const hasMoreUsers = users.length > MAX_SHOWN_USERS

	return (
		<div className='absolute top-2 h-12 right-2 bg-white rounded-md p-3 flex items-center shadow-md'>
			<div className='flex gap-x-2'>
				{/* 展示其他用户的用户信息 */}
				{users.slice(0, MAX_SHOWN_USERS).map(({ connectionId, info }) => {
					return (
						<UserAvatar
							borderColor={connectionIdToColor(connectionId)}
							key={connectionId}
							src={info?.picture}
							name={info?.name}
							fallback={info?.name?.[0] || 'T'}
						/>
					)
				})}
				{/* 展示当前用户的用户信息 */}
				{currentUser && (
					<UserAvatar
						borderColor={connectionIdToColor(currentUser.connectionId)}
						src={currentUser.info?.picture}
						name={`${currentUser.info?.name} (You)`}
						fallback={currentUser.info?.name?.[0]}
					/>
				)}
				{/* 超出限制的用户信息展示处理 */}
				{hasMoreUsers && (
					<UserAvatar
						name={`${users.length - MAX_SHOWN_USERS} more`}
						fallback={`+${users.length - MAX_SHOWN_USERS}`}
					/>
				)}
			</div>
		</div>
	)
}

export const ParticipantsSkeleton = () => {
	return (
		<div className='absolute top-2 h-12 right-2 bg-white rounded-md p-3 flex items-center shadow-md w-[100px] '></div>
	)
}

export default Participants
