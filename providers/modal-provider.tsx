'use client'

import RenameModal from '@/components/modals/rename-modal'
import { useEffect, useState } from 'react'

// 用于确保在客户端环境准备好之后在进行组件展示 
// 在服务端渲染与客户端交互的场景中，这样设计有助于优化页面性能
const ModalProvider = () => {
	const [isMounted, setIsMounted] = useState(false)

	// 仅在客户端渲染时才显示该组件
	useEffect(() => {
		setIsMounted(true)
	}, [])

	if (!isMounted) return null

	return (
		<>
			<RenameModal></RenameModal>
		</>
	)
}

export default ModalProvider
