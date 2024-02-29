'use client'

import { memo } from 'react'
import { Camera, Color } from '@/types/canvas'
import { useMutation, useSelf } from '@/liveblocks.config'
import { useDeleteLayers } from '@/hooks/use-delete-layers'
import { useSelectionBounds } from '@/hooks/use-selection-bounds'

import Hint from '@/components/hint'
import ColorPicker from './color-picker'
import { Button } from '@/components/ui/button'
import { BringToFront, SendToBack, Trash2 } from 'lucide-react'

interface SelectionToolsProps {
	camera: Camera
	setLastUsedColor: (color: Color) => void
}

const SelectionTools = memo(
	({ camera, setLastUsedColor }: SelectionToolsProps) => {
		const selection = useSelf((me) => me.presence.selection)

		// 变更（降下）图层层级
		const moveToBack = useMutation(
			({ storage }) => {
				// 获取存储在 storage 中的实时图层 ID 列表 liveLayerIds。
				const liveLayerIds = storage.get('layerIds')
				// 存储图层的新索引
				const indices: number[] = []
				// 将映射关系转变为不可变的数组用于遍历
				const arr = liveLayerIds.toImmutable()

				// 遍历数组，如果当前图层 ID 在 selection 中，则将索引添加到 indices 数组中。
				for (let i = 0; i < arr.length; i++) {
					if (selection.includes(arr[i])) {
						indices.push(i)
					}
				}

				for (let i = 0; i < indices.length; i++) {
					// 将当前选中图层在存储数组中的索引顺序变更到数组的起始位置 即降低层级
					liveLayerIds.move(indices[i], i)
				}
			},
			[selection]
		)
		// 变更（ 提升）图层层级
		const moveToFront = useMutation(
			({ storage }) => {
				// 获取存储在 storage 中的实时图层 ID 列表 liveLayerIds。
				const liveLayerIds = storage.get('layerIds')
				// 存储图层的新索引
				const indices: number[] = []
				// 将映射关系转变为不可变的数组用于遍历
				const arr = liveLayerIds.toImmutable()
				// 遍历数组，如果当前图层 ID 在 selection 中，则将索引添加到 indices 数组中。
				for (let i = 0; i < arr.length; i++) {
					if (selection.includes(arr[i])) {
						indices.push(i)
					}
				}
				// 从后往前遍历 根据当前索引计算目标索引，将选中图层逐个移动到数组末尾
				for (let i = indices.length - 1; i >= 0; i--) {
					liveLayerIds.move(
						indices[i],
						arr.length - 1 - (indices.length - 1 - i)
					)
				}
			},
			[selection]
		)

		const setFill = useMutation(
			({ storage }, fill: Color) => {
				// 获取当前图层映射关系
				const liveLayer = storage.get('layers')
				// 更新图层填充颜色变量
				setLastUsedColor(fill)

				selection.forEach((id) => {
					// 实际更新
					liveLayer.get(id)?.set('fill', fill)
				})
			},
			[selection, setLastUsedColor]
		)

		const deleteLayers = useDeleteLayers()

		const selectionBounds = useSelectionBounds()

		if (!selectionBounds) return null

		// 计算 SelectionTool 位置 让其定位在图层 居中的正上方
		const x = selectionBounds.width / 2 + selectionBounds.x + camera.x
		const y = selectionBounds.y + camera.y

		return (
			<div
				className='absolute p-3 rounded-xl bg-white shadow-sm border flex select-none'
				style={{
					transform: `translate(
            calc(${x}px - 50%),
            calc(${y - 16}px - 100%)
          )`,
				}}>
				<ColorPicker onChange={setFill} />
				<div className='flex flex-col gap-y-0.5'>
					<Hint label='Bring to front'>
						<Button variant='board' size='icon' onClick={moveToFront}>
							<BringToFront />
						</Button>
					</Hint>
					<Hint label='Send to back' side='bottom'>
						<Button variant='board' size='icon' onClick={moveToBack}>
							<SendToBack />
						</Button>
					</Hint>
				</div>
				<div className='flex items-center pl-2 ml-2 border-l border-neutral-200'>
					<Hint label='Delete'>
						<Button variant='board' size='icon' onClick={deleteLayers}>
							<Trash2 />
						</Button>
					</Hint>
				</div>
			</div>
		)
	}
)

SelectionTools.displayName = 'SelectionTools'
export default SelectionTools
