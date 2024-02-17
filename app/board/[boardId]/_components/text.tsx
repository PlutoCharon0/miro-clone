import { TextLayer } from '@/types/canvas'
import { Kalam } from 'next/font/google'

import ContentEditable, { ContentEditableEvent } from 'react-contenteditable'

const font = Kalam({
	subsets: ['latin'],
	weight: '400',
})

interface TextProps {
	id: string
	layer: TextLayer
	onPointerDown: (e: React.PointerEvent, id: string) => void
	selectionColor: string
}

const Text = ({ id, layer, onPointerDown, selectionColor }: TextProps) => {
	const { x, y, width, height, fill, value } = layer

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
			<ContentEditable html={'Text'} onChange={() => {}} />
		</foreignObject>
	)
}

export default Text
