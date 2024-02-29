'use client'
// 控制图形缩放组件
import { memo } from 'react'
import { LayerType, Side, XYWH } from '@/types/canvas'
import { useSelectionBounds } from '@/hooks/use-selection-bounds'
import { useSelf, useStorage } from '@/liveblocks.config'

interface SelectionBoxProps {
	onResizeHandlePointerDown: (corner: Side, initialBounds: XYWH) => void
}
const HANDLE_WIDTH = 8

const SelectionBox = memo(
	({ onResizeHandlePointerDown }: SelectionBoxProps) => {
		// 判断是否仅有一个图层被选中
		const soleLayerId = useSelf((me) =>
			me.presence.selection.length === 1 ? me.presence.selection[0] : null
		)

		// 是否显示缩放控件 (仅当只有一个图层被选中且图层类型不是路径类型时显示)
		const isShowingHandles = useStorage(
			(root) =>
				soleLayerId && root.layers.get(soleLayerId)?.type !== LayerType.Path
		)

		const bounds = useSelectionBounds()

		if (!bounds) return null

		return (
			<>
				{/* 边框 */}
				<rect
					className='fill-transparent stroke-blue-500 stroke-1 pointer-events-none'
					style={{
						transform: `translate(${bounds.x}px, ${bounds.y}px)`,
					}}
					x={0}
					y={0}
					width={bounds.width}
					height={bounds.height}
				/>
				{isShowingHandles && (
					<>
						{/* 左上角 */}
						<rect
							className='fill-white stroke-1 stroke-blue-500'
							x={0}
							y={0}
							style={{
								cursor: 'nwse-resize',
								width: `${HANDLE_WIDTH}px`,
								height: `${HANDLE_WIDTH}px`,
								/* 为了将控制点的中心放置在边界框左上角的位置（bounds.x, bounds.y），
								因此需要减去它自身宽度和高度的一半以使其左上角与边界框对齐。*/
								transform: `
                translate(
                  ${bounds.x - HANDLE_WIDTH / 2}px,
                  ${bounds.y - HANDLE_WIDTH / 2}px
                )
              `,
							}}
							onPointerDown={(e) => {
								e.stopPropagation()
								onResizeHandlePointerDown(Side.Top + Side.Left, bounds)
							}}
						/>
						{/* 上居中 */}
						<rect
							className='fill-white stroke-1 stroke-blue-500'
							x={0}
							y={0}
							style={{
								cursor: 'ns-resize',
								width: `${HANDLE_WIDTH}px`,
								height: `${HANDLE_WIDTH}px`,
								transform: `
                translate(
                  ${bounds.x + bounds.width / 2 - HANDLE_WIDTH / 2}px, 
                  ${bounds.y - HANDLE_WIDTH / 2}px
                )
              `,
							}}
							onPointerDown={(e) => {
								e.stopPropagation()
								onResizeHandlePointerDown(Side.Top, bounds)
							}}
						/>
						{/* 右上角 */}
						<rect
							className='fill-white stroke-1 stroke-blue-500'
							x={0}
							y={0}
							style={{
								cursor: 'nesw-resize',
								width: `${HANDLE_WIDTH}px`,
								height: `${HANDLE_WIDTH}px`,
								transform: `
                translate(
                  ${bounds.x - HANDLE_WIDTH / 2 + bounds.width}px,
                  ${bounds.y - HANDLE_WIDTH / 2}px
                )`,
							}}
							onPointerDown={(e) => {
								e.stopPropagation()
								onResizeHandlePointerDown(Side.Top + Side.Right, bounds)
							}}
						/>
						{/* 右居中 */}
						<rect
							className='fill-white stroke-1 stroke-blue-500'
							x={0}
							y={0}
							style={{
								cursor: 'ew-resize',
								width: `${HANDLE_WIDTH}px`,
								height: `${HANDLE_WIDTH}px`,
								transform: `
                translate(
                  ${bounds.x - HANDLE_WIDTH / 2 + bounds.width}px, 
                  ${bounds.y + bounds.height / 2 - HANDLE_WIDTH / 2}px
                )`,
							}}
							onPointerDown={(e) => {
								e.stopPropagation()
								onResizeHandlePointerDown(Side.Right, bounds)
							}}
						/>
						{/* 右下角 */}
						<rect
							className='fill-white stroke-1 stroke-blue-500'
							x={0}
							y={0}
							style={{
								cursor: 'nwse-resize',
								width: `${HANDLE_WIDTH}px`,
								height: `${HANDLE_WIDTH}px`,
								transform: `
                translate(
                  ${bounds.x - HANDLE_WIDTH / 2 + bounds.width}px, 
                  ${bounds.y - HANDLE_WIDTH / 2 + bounds.height}px
                )`,
							}}
							onPointerDown={(e) => {
								e.stopPropagation()
								onResizeHandlePointerDown(Side.Bottom + Side.Right, bounds)
							}}
						/>
						{/* 下居中 */}
						<rect
							className='fill-white stroke-1 stroke-blue-500'
							x={0}
							y={0}
							style={{
								cursor: 'ns-resize',
								width: `${HANDLE_WIDTH}px`,
								height: `${HANDLE_WIDTH}px`,
								transform: `
                translate(
                  ${bounds.x + bounds.width / 2 - HANDLE_WIDTH / 2}px,
                  ${bounds.y - HANDLE_WIDTH / 2 + bounds.height}px
                )`,
							}}
							onPointerDown={(e) => {
								e.stopPropagation()
								onResizeHandlePointerDown(Side.Bottom, bounds)
							}}
						/>
						{/* 左下角*/}
						<rect
							className='fill-white stroke-1 stroke-blue-500'
							x={0}
							y={0}
							style={{
								cursor: 'nesw-resize',
								width: `${HANDLE_WIDTH}px`,
								height: `${HANDLE_WIDTH}px`,
								transform: `
                translate(
                  ${bounds.x - HANDLE_WIDTH / 2}px,
                  ${bounds.y - HANDLE_WIDTH / 2 + bounds.height}px
                )`,
							}}
							onPointerDown={(e) => {
								e.stopPropagation()
								onResizeHandlePointerDown(Side.Bottom + Side.Left, bounds)
							}}
						/>
						{/* 左居中 */}
						<rect
							className='fill-white stroke-1 stroke-blue-500'
							x={0}
							y={0}
							style={{
								cursor: 'ew-resize',
								width: `${HANDLE_WIDTH}px`,
								height: `${HANDLE_WIDTH}px`,
								transform: `
                translate(
                  ${bounds.x - HANDLE_WIDTH / 2}px,
                  ${bounds.y - HANDLE_WIDTH / 2 + bounds.height / 2}px
                )`,
							}}
							onPointerDown={(e) => {
								e.stopPropagation()
								onResizeHandlePointerDown(Side.Left, bounds)
							}}
						/>
					</>
				)}
			</>
		)
	}
)

SelectionBox.displayName = 'SelectionBox'

export default SelectionBox
