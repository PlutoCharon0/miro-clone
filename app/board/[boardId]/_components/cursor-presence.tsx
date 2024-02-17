'use client'

import { memo } from 'react'

import { useOthersConnectionIds } from '@/liveblocks.config'

import Cursor from './cursor'

const Cursors = () => {
	// 获取当前操作画板的其他用户的id
	const ids = useOthersConnectionIds()

	return (
		<>
			{ids.map((connectionId) => {
				console.log(connectionId, 'id')
				return <Cursor key={connectionId} connectionId={connectionId} />
			})}
		</>
	)
}

const CursorsPresence = memo(() => {
	return (
		<>
			<Cursors />
		</>
	)
})

CursorsPresence.displayName = 'CursorsPresence'

export default CursorsPresence
