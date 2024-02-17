'use client'
import { nanoid } from 'nanoid'
import { useCallback, useMemo, useState } from 'react'
import Info from './info'
import Participants from './participants'
import Toolbar from './toolbar'
import {
	Camera,
	CanvasMode,
	CanvasState,
	Color,
	LayerType,
	Point,
	Side,
	XYWH,
} from '@/types/canvas'
import {
	useCanRedo,
	useCanUndo,
	useHistory,
	useMutation,
	useOthersMapped,
	useStorage,
} from '@/liveblocks.config'
import CursorsPresence from './cursor-presence'
import {
	connectionIdToColor,
	findInterselectingLayerWithRectangle,
	pointerEventToCanvasPoint,
	resizeBounds,
} from '@/lib/utils'
import { LiveObject } from '@liveblocks/client'
import LayerPreview from './layer-preview'
import SelectionBox from './selection-box'
import SelectionTools from './selection-tools'

const MAX_LAYERS = 100

interface CanvasProps {
	boardId: string
}

const Canvas = ({ boardId }: CanvasProps) => {
	const layerIds = useStorage((root) => root.layerIds)

	const [canvasState, setCanvasState] = useState<CanvasState>({
		mode: CanvasMode.None,
	})

	const history = useHistory()
	const canUndo = useCanUndo()
	const canRedo = useCanRedo()

	const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 })

	const [lastUsedColor, setLastUsedColor] = useState<Color>({
		r: 255,
		g: 255,
		b: 255,
	})

	const insertLayer = useMutation(
		(
			{ storage, setMyPresence },
			layerType:
				| LayerType.Ellipse
				| LayerType.Rectangle
				| LayerType.Text
				| LayerType.Note,
			position: Point
		) => {
			const liveLayers = storage.get('layers')

			if (liveLayers.size >= MAX_LAYERS) {
				return
			}

			const liveLayerIds = storage.get('layerIds')
			const layerId = nanoid()
			const layer = new LiveObject({
				type: layerType,
				x: position.x,
				y: position.y,
				width: 100,
				height: 100,
				fill: lastUsedColor,
			})

			liveLayerIds.push(layerId)
			liveLayers.set(layerId, layer)

			setMyPresence({ selection: [layerId] }, { addToHistory: true })
			setCanvasState({
				mode: CanvasMode.None,
			})
		},
		[lastUsedColor]
	)

	const translateSelectedLayers = useMutation(
		({ storage, self }, point: Point) => {
			if (canvasState.mode !== CanvasMode.Translating) return

			const offset = {
				x: point.x - canvasState.current.x,
				y: point.y - canvasState.current.y,
			}

			const liveLayers = storage.get('layers')

			for (const id of self.presence.selection) {
				const layer = liveLayers.get(id)

				if (layer) {
					layer.update({
						x: layer.get('x') + offset.x,
						y: layer.get('y') + offset.y,
					})
				}
			}
			setCanvasState({
				mode: CanvasMode.Translating,
				current: point,
			})
		},
		[canvasState]
	)

	const unSelectLayers = useMutation(({ self, setMyPresence }) => {
		if (self.presence.selection.length > 0) {
			setMyPresence(
				{ selection: [] },
				{
					addToHistory: true,
				}
			)
		}
	}, [])

	const startMultiSelection = useCallback((current: Point, origin: Point) => {
		if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
			console.log('ATTEMPING TO SELECTION NET')
			setCanvasState({
				mode: CanvasMode.SelectionNet,
				origin,
				current,
			})
		}
	}, [])

	const updateSelectionNet = useMutation(
		({ storage, setMyPresence }, current: Point, origin: Point) => {
			const layers = storage.get('layers').toImmutable()

			setCanvasState({
				mode: CanvasMode.SelectionNet,
				current,
				origin,
			})
			const ids = findInterselectingLayerWithRectangle(
				layerIds,
				layers,
				origin,
				current
			)
			setMyPresence({ selection: ids })
		},
		[layerIds]
	)

	const resizeSelectedLayer = useMutation(
		({ storage, self }, point: Point) => {
			if (canvasState.mode !== CanvasMode.Resizing) return

			const bounds = resizeBounds(
				canvasState.initialBounds,
				canvasState.corner,
				point
			)

			const liveLayer = storage.get('layers')

			const layer = liveLayer.get(self.presence.selection[0])

			if (layer) {
				layer.update(bounds)
			}
		},
		[canvasState]
	)

	// 图形缩放事件
	const onResizeHandlePointerDown = useCallback(
		(corner: Side, initialBounds: XYWH) => {
			console.log({
				corner,
				initialBounds,
			})

			history.pause()
			setCanvasState({
				mode: CanvasMode.Resizing,
				initialBounds,
				corner,
			})
		},
		[history]
	)

	// 监听滚动事件
	const onWheel = useCallback((e: React.WheelEvent) => {
		setCamera((camera) => ({
			x: camera.x - e.deltaX,
			y: camera.y - e.deltaY,
		}))
	}, [])

	// 监听光标移动事件
	const onPointerMove = useMutation(
		({ setMyPresence }, e: React.PointerEvent) => {
			e.preventDefault()

			const current = pointerEventToCanvasPoint(e, camera)

			if (canvasState.mode === CanvasMode.Pressing) {
				startMultiSelection(current, canvasState.origin)
			} else if (canvasState.mode === CanvasMode.SelectionNet) {
				updateSelectionNet(current, canvasState.origin)
			} else if (canvasState.mode === CanvasMode.Translating) {
				console.log('LayerTranslating')
				translateSelectedLayers(current)
			}
			if (canvasState.mode === CanvasMode.Resizing) {
				resizeSelectedLayer(current)
			}

			setMyPresence({ cursor: current })
		},
		[camera, canvasState, resizeSelectedLayer, translateSelectedLayers]
	)

	// 监听光标离开事件
	const onPointerLeave = useMutation(({ setMyPresence }) => {
		setMyPresence({ cursor: null })
	}, [])

	const onPointerDown = useCallback(
		(e: React.PointerEvent) => {
			const point = pointerEventToCanvasPoint(e, camera)
			if (canvasState.mode === CanvasMode.Inserting) return
			// TODO: Add case for drawing

			setCanvasState({
				origin: point,
				mode: CanvasMode.Pressing,
			})
		},
		[camera, canvasState.mode, setCanvasState]
	)

	// 监听光标点击事件
	const onPointerUp = useMutation(
		({}, e) => {
			const point = pointerEventToCanvasPoint(e, camera)

			if (
				canvasState.mode === CanvasMode.None ||
				canvasState.mode === CanvasMode.Pressing
			) {
				console.log('Unselect')
				unSelectLayers()
				setCanvasState({
					mode: CanvasMode.None,
				})
			} else if (canvasState.mode === CanvasMode.Inserting) {
				insertLayer(canvasState.layerType, point)
			} else {
				setCanvasState({
					mode: CanvasMode.None,
				})
			}
			history.resume()
		},
		[camera, canvasState, history, insertLayer]
	)

	const selections = useOthersMapped((other) => other.presence.selection)

	// 监听其他用户的模块选中事件
	const onLayerPointerDown = useMutation(
		({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
			if (
				canvasState.mode === CanvasMode.Pencil ||
				canvasState.mode === CanvasMode.Inserting
			)
				return
			history.pause()
			e.stopPropagation()

			const point = pointerEventToCanvasPoint(e, camera)

			if (!self.presence.selection.includes(layerId)) {
				setMyPresence({ selection: [layerId] }, { addToHistory: true })
			}
			setCanvasState({
				mode: CanvasMode.Translating,
				current: point,
			})
			console.log('LayerPointerDown')
		},
		[setCanvasState, camera, history, canvasState.mode]
	)

	// 构建其他用户的光标选中效果
	const layerIdsToColorsSelection = useMemo(() => {
		const layerIdsToColorsSelection: Record<string, string> = {}

		for (const user of selections) {
			const [connectionId, selection] = user
			for (const layerId of selection) {
				layerIdsToColorsSelection[layerId] = connectionIdToColor(connectionId)
			}
		}
		return layerIdsToColorsSelection
	}, [selections])

	return (
		<main className='h-full w-full relative bg-neutral-100 touch-none'>
			<Info boardId={boardId} />
			<Participants />
			<Toolbar
				canvasState={canvasState}
				setCanvasState={setCanvasState}
				canRedo={canRedo}
				canUndo={canUndo}
				undo={history.undo}
				redo={history.redo}
			/>
			<SelectionTools camera={camera} setLastUsedColor={setLastUsedColor} />
			<svg
				className='h-[100vh] w-[100vw]'
				onWheel={onWheel}
				onPointerMove={onPointerMove}
				onPointerLeave={onPointerLeave}
				onPointerUp={onPointerUp}
				onPointerDown={onPointerDown}>
				<g
					style={{
						transform: `translate(${camera.x}px, ${camera.y}px)`,
					}}>
					{layerIds.map((layerId) => (
						<LayerPreview
							key={layerId}
							id={layerId}
							onLayerPointerDown={onLayerPointerDown}
							selectionColor={layerIdsToColorsSelection[layerId]}
						/>
					))}
					<SelectionBox onResizeHandlePointerDown={onResizeHandlePointerDown} />
					{canvasState.mode === CanvasMode.SelectionNet &&
						canvasState.current != null && (
							<rect
								className='fill-blue-500/5 stroke-blue-500 stroke-1'
								x={Math.min(canvasState.origin.x, canvasState.current.x)}
								y={Math.min(canvasState.origin.y, canvasState.current.y)}
								width={Math.abs(canvasState.origin.x - canvasState.current.x)}
								height={Math.abs(canvasState.origin.y - canvasState.current.y)}
							/>
						)}
					<CursorsPresence />
				</g>
			</svg>
		</main>
	)
}

export default Canvas
