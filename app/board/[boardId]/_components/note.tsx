import ContentEditable, { ContentEditableEvent } from 'react-contenteditable'

import { NoteLayer } from '@/types/canvas'
import { cn, colorToCss, getContrastingTextColor } from '@/lib/utils'
import { useMutation } from '@/liveblocks.config'
import { useState } from 'react'

const calculateFontSize = (width: number, height: number) => {
	const maxFontSize = 96
	const scaleFactor = 0.15
	const fontSizeBasedOnHeight = height * scaleFactor
	const fontSizeBasedOnWidth = width * scaleFactor

	return Math.min(fontSizeBasedOnHeight, fontSizeBasedOnWidth, maxFontSize)
}

interface NoteProps {
	id: string
	layer: NoteLayer
	onPointerDown: (e: React.PointerEvent, id: string) => void
	selectionColor?: string
}
const Note = ({ layer, onPointerDown, id, selectionColor }: NoteProps) => {
	const { x, y, width, height, fill, value } = layer

	const updateValue = useMutation(({ storage }, newValue: string) => {
		const liveLayers = storage.get('layers')

		liveLayers.get(id)?.set('value', newValue)
	}, [])

	const [inputValue, setInputValue] = useState(value || 'Text')

	const handleContentChange = (e: ContentEditableEvent) => {
		const newValue = e.target.value

		if (!newValue && inputValue === 'Text') {
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
				backgroundColor: fill ? colorToCss(fill) : '#000',
			}}
			className='shadow-md drop-shadow-xl'>
			<ContentEditable
				html={inputValue}
				onChange={handleContentChange}
				className={cn(
					'h-full w-full flex items-center justify-center text-center outline-none',
					'font-Kalam'
				)}
				style={{
					fontSize: calculateFontSize(width, height),
					color: fill ? getContrastingTextColor(fill) : '#000',
				}}
			/>
		</foreignObject>
	)
}

export default Note
