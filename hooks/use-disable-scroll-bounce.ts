import { useEffect } from 'react'

/**
 * 用于在组件挂载时禁用页面滚动回弹效果 并在组件卸载时恢复页面滚动的默认行为。
 */
export const useDisableScrollBounce = () => {
	useEffect(() => {
		// 'overflow-hidden' 阻止内容区域滚动（即隐藏溢出内容） 'overscroll-none' s禁用滚动回弹效果。
		document.body.classList.add('overflow-hidden', 'overscroll-none')
		return () => {
			document.body.classList.remove('overflow-hidden', 'overscroll-none')
		}
	})
}
