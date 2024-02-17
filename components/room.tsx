'use client'

import { ReactNode } from 'react'
import { RoomProvider } from '@/liveblocks.config'
import { ClientSideSuspense } from '@liveblocks/react'
import { LiveList, LiveMap, LiveObject } from '@liveblocks/client'
import { Layer } from '@/types/canvas'

interface RoomProps {
	children: ReactNode
	roomId: string
	fallback: NonNullable<ReactNode> | null
}

// 创建进行协作的独立虚拟空间
const Room = ({ children, roomId, fallback }: RoomProps) => {
	return (
		<RoomProvider
			id={roomId}
			initialPresence={{
				cursor: null,
				selection: []
			}}
			initialStorage={{
				layers: new LiveMap<string, LiveObject<Layer>>(),
				layerIds: new LiveList<string>()
			}}
			>
			<ClientSideSuspense fallback={fallback}>
				{() => children}
			</ClientSideSuspense>
		</RoomProvider>
	)
}

export default Room
