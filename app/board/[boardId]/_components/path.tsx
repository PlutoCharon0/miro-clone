import getStroke from 'perfect-freehand' // 获取一个点数组，该数组描述围绕输入点的多边形。
import { getSvgPathFromStroke } from '@/lib/utils'

interface PathProps {
	x: number
	y: number
	points: number[][]
	fill: string
	onPointerDown?: (e: React.PointerEvent) => void
	stroke?: string
}

const Path = ({ x, y, points, fill, onPointerDown, stroke }: PathProps) => {
	
	return (
		<path
			className='drop-shadow-md'
			onPointerDown={onPointerDown}
			d={getSvgPathFromStroke(
				getStroke(points, {
					size: 16, // 笔划的基本大小（直径）。
					thinning: 0.5, // 压力对笔画大小的影响。
					smoothing: 0.5, // 软化程度
					streamline: 0.5, // 流畅程度
				})
			)}
			style={{
				transform: `translate(${x}px, ${y}px)`,
			}}
			x={0}
			y={0}
			fill={fill}
			stroke={stroke}
			strokeWidth={1}
		/>
	)
}

export default Path
