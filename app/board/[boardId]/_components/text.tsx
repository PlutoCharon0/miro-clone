import { cn, colorToCss } from '@/lib/utils'
import { useMutation } from '@/liveblocks.config'
import { TextLayer } from '@/types/canvas'
import { useState } from 'react'

import ContentEditable, { ContentEditableEvent } from 'react-contenteditable'

interface TextProps {
	id: string
	layer: TextLayer
	onPointerDown: (e: React.PointerEvent, id: string) => void
	selectionColor: string
}

// 计算文本大小 自适应文本框架的放缩
const calculateFontSize = (width: number, height: number) => {
	// 允许最大字体大小
	const maxFontSize = 96
	// 字体放缩因子 用于根据容器尺寸调整字体大小
	const scaleFactor = 0.5
	const fontSizeBasedOnWidth = width * scaleFactor
	const fontSizeBasedOnHeight = height * scaleFactor

	return Math.min(fontSizeBasedOnWidth, fontSizeBasedOnHeight, maxFontSize)
}

const Text = ({ id, layer, onPointerDown, selectionColor }: TextProps) => {
	const { x, y, width, height, fill, value } = layer

	const updateValue = useMutation(({ storage }, newValue: string) => {
		const liveLayers = storage.get('layers')

		liveLayers.get(id)?.set('value', newValue)
	}, [])

	const [inputValue, setInputValue] = useState(value || 'Text')

	const handleContentChange = (e: ContentEditableEvent) => {
		const newValue = e.target.value

		if (!newValue && inputValue === 'Text') {
			// 当内容为空字符串且初始值也为 'Text' 时，保持空白（不触发更新）
			return
		}

		setInputValue(newValue)
		updateValue(e.target.value)
	}

	return (
		<foreignObject
			x={x}
			y={y}
			width={width}
			height={height}
			onPointerDown={(e) => onPointerDown(e, id)}
			style={{
				outline: selectionColor ? `1px solid ${selectionColor}` : 'none',
			}}>
			<ContentEditable
				html={inputValue}
				onChange={handleContentChange}
				className={cn(
					'h-full w-full flex items-center justify-center text-center drop-shadow-md outline-none',
					'font-Kalam'
				)}
				style={{
					fontSize: calculateFontSize(width, height),
					color: fill ? colorToCss(fill) : '#000',
				}}
			/>
		</foreignObject>
	)
}

export default Text
