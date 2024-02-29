'use client'

import { memo } from 'react'
import { shallow } from '@liveblocks/client'
import { colorToCss } from '@/lib/utils'
import { useOthersConnectionIds, useOthersMapped } from '@/liveblocks.config'

import Cursor from './cursor'
import Path from './path'

const Cursors = () => {
	// 获取其他用户的连接ID
	const ids = useOthersConnectionIds()

	return (
		<>
		{/* 并根据ids来渲染光标组件 */}
			{ids.map((connectionId) => {
				return <Cursor key={connectionId} connectionId={connectionId} />
			})}
		</>
	)
}

// 其他用户的绘画痕迹展示
const Drafts = () => {
	const others = useOthersMapped(
		(other) => ({
			pencilDraft: other.presence.pencilDraft,
			penColor: other.presence.penColor,
		}),
		shallow
	)

	return (
		<>
			{others.map(([key, other]) => {
				if (other.pencilDraft) {
					return (
						<Path
							x={0}
							y={0}
							key={key}
							points={other.pencilDraft}
							fill={other.penColor ? colorToCss(other.penColor) : '#000'}
						/>
					)
				}
				return null
			})}
		</>
	)
}

// 使用memo 让组件能够在不改变 props 的情况下跳过重新渲染。 避免不必要的渲染
const CursorsPresence = memo(() => {
	return (
		<>
			<Drafts />
			<Cursors />
		</>
	)
})

CursorsPresence.displayName = 'CursorsPresence'

export default CursorsPresence
