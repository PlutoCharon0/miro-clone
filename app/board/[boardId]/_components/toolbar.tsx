import { CanvasMode, CanvasState, LayerType } from '@/types/canvas'

import ToolButton from './tool-button'
import {
	Circle,
	MousePointer2,
	Pencil,
	Redo2,
	Square,
	StickyNote,
	Type,
	Undo2,
} from 'lucide-react'

interface ToolbarProps {
	canvasState: CanvasState
	setCanvasState: (newState: CanvasState) => void
	undo: () => void
	redo: () => void
	canUndo: boolean
	canRedo: boolean
}

const Toolbar = ({
	canvasState,
	setCanvasState,
	undo,
	redo,
	canUndo,
	canRedo,
}: ToolbarProps) => {
	
	return (
		<div className='absolute top-2/4 left-2  -translate-y-[50%]  flex flex-col gap-y-4'>
			<div className='bg-white rounded-md p-1.5 flex gap-y-1 flex-col items-center shadow-md'>
				<ToolButton
					label='Select'
					icon={MousePointer2}
					onClick={() =>
						setCanvasState({
							mode: CanvasMode.None,
						})
					}
					isActive={
						canvasState.mode === CanvasMode.None ||
						canvasState.mode === CanvasMode.Translating ||
						canvasState.mode === CanvasMode.SelectionNet ||
						canvasState.mode === CanvasMode.Pressing ||
						canvasState.mode === CanvasMode.Resizing
					}
				/>
				<ToolButton
					label='Text'
					icon={Type}
					onClick={() =>
						setCanvasState({
							mode: CanvasMode.Inserting,
							layerType: LayerType.Text,
						})
					}
					isActive={
						canvasState.mode === CanvasMode.Inserting &&
						canvasState.layerType === LayerType.Text
					}
				/>
				<ToolButton
					label='Sticky note'
					icon={StickyNote}
					onClick={() =>
						setCanvasState({
							mode: CanvasMode.Inserting,
							layerType: LayerType.Note,
						})
					}
					isActive={
						canvasState.mode === CanvasMode.Inserting &&
						canvasState.layerType === LayerType.Note
					}
				/>
				<ToolButton
					label='Rectangle'
					icon={Square}
					onClick={() =>
						setCanvasState({
							mode: CanvasMode.Inserting,
							layerType: LayerType.Rectangle,
						})
					}
					isActive={
						canvasState.mode === CanvasMode.Inserting &&
						canvasState.layerType === LayerType.Rectangle
					}
				/>
				<ToolButton
					label='Ellipse'
					icon={Circle}
					onClick={() =>
						setCanvasState({
							mode: CanvasMode.Inserting,
							layerType: LayerType.Ellipse,
						})
					}
					isActive={
						canvasState.mode === CanvasMode.Inserting &&
						canvasState.layerType === LayerType.Ellipse
					}
				/>
				<ToolButton
					label='Pencil'
					icon={Pencil}
					onClick={() =>
						setCanvasState({
							mode: CanvasMode.Pencil,
						})
					}
					isActive={canvasState.mode === CanvasMode.Pencil}
				/>
			</div>
			<div className='bg-white rounded-md flex p-1.5 flex-col items-center shadow-md'>
				<ToolButton
					label='Undo'
					icon={Undo2}
					onClick={undo}
					isDisadbled={!canUndo}
				/>
				<ToolButton
					label='Redo'
					icon={Redo2}
					onClick={redo}
					isDisadbled={!canRedo}
				/>
			</div>
		</div>
	)
}

// 配置骨架屏
export const ToolbarSkeleton = () => {
	return (
		<div className='absolute top-2/4 left-2  -translate-y-[50%]  flex flex-col gap-y-4 bg-white h-[360px] w-[52px] shadow-md rounded-md'></div>
	)
}

export default Toolbar
