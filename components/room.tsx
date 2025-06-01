'use client'

import { Layer } from '@/types/canvas'
import { ReactNode } from 'react'
import { LiveList, LiveMap, LiveObject } from '@liveblocks/client'

import { RoomProvider } from '@/liveblocks.config'
import { ClientSideSuspense } from '@liveblocks/react'

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
		// initialPresence 用于配置页面（画板）的初始状态 相关值类型在配置文件中定义
			initialPresence={{
				cursor: null,
				selection: [],
				pencilDraft: null,
				penColor: null,
			}}
			/* initialStorage 首次进入新房间时要创建的初始存储结构。
			存储数据是共享的，属于房间本身。即使在所有用户离开房间后，它仍然存在，并且每个客户端都可以更改 */
			initialStorage={{
				layers: new LiveMap<string, LiveObject<Layer>>(),
				layerIds: new LiveList<string>(),
			}}>
			{/* fallback 用于配置页面的加载效果 （在服务端渲染时，页面加载时，会显示 fallback 的内容，直到服务端渲染完成，页面才开始加载）*/}

			<ClientSideSuspense fallback={fallback}>
				{() => children}
			</ClientSideSuspense>
		</RoomProvider>
	)
}

export default Room
