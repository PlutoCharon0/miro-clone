'use client'

import { nanoid } from 'nanoid'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useDisableScrollBounce } from '@/hooks/use-disable-scroll-bounce'
import { useDeleteLayers } from '@/hooks/use-delete-layers'
import { LiveObject } from '@liveblocks/client'
import {
	useCanRedo,
	useCanUndo,
	useHistory,
	useMutation,
	useOthersMapped,
	useSelf,
	useStorage,
} from '@/liveblocks.config'

import {
	colorToCss,
	connectionIdToColor,
	findInterselectingLayerWithRectangle,
	penPointsToPathLayer,
	pointerEventToCanvasPoint,
	resizeBounds,
} from '@/lib/utils'

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

import Info from './info'
import Participants from './participants'
import Toolbar from './toolbar'
import CursorsPresence from './cursor-presence'
import LayerPreview from './layer-preview'
import SelectionBox from './selection-box'
import SelectionTools from './selection-tools'
import Path from './path'

const MAX_LAYERS = 100

interface CanvasProps {
	boardId: string
}

const Canvas = ({ boardId }: CanvasProps) => {
	console.log('Canvas Render')

	// 获取当前画板中实时图层的id集合
	const layerIds = useStorage((root) => root.layerIds)

	const pencilDraft = useSelf((me) => me.presence.pencilDraft)
	// 记录画板操作状态
	const [canvasState, setCanvasState] = useState<CanvasState>({
		mode: CanvasMode.None,
	})

	useDisableScrollBounce()
	const history = useHistory() // 返回房间（画板操作）的历史记录
	// 若存在操作可撤销 则返回一个用于撤消当前客户端执行的最后一个操作 的函数 反之返回false
	const canUndo = useCanUndo()
	// 若存在操作可撤销 则返回一个用于重做当前客户端执行的最后一个操作 的函数 反之返回false
	const canRedo = useCanRedo()

	// 用于表示Canvas元素在浏览器视图窗口的偏移量
	const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 })

	const [lastUsedColor, setLastUsedColor] = useState<Color>({
		r: 255,
		g: 255,
		b: 255,
	})

	/**
	 * 主要负责在应用中插入一个新的图层，根据指定的类型和位置进行创建，并将其添加到状态管理器中，同时更新用户活动状态及画布状态。
	 */
	const insertLayer = useMutation(
		(
			// 一个包含应用状态和状态更新函数的对象
			// storage 用于获取和设置图层相关数据的状态容器
			// setMyPresence 设置用户在应用中的活动状态，如选中图层等信息，并可选择是否将操作记录到历史记录中。
			{ storage, setMyPresence },
			// 图层类型
			layerType:
				| LayerType.Ellipse
				| LayerType.Rectangle
				| LayerType.Text
				| LayerType.Note,
			// 图层坐标
			position: Point
		) => {
			// 获取当前所有实时图层的集映射合
			const liveLayers = storage.get('layers')

			// 判断当前画板的图层数量是否达到最大限制 如果达到则直接返回
			if (liveLayers.size >= MAX_LAYERS) {
				return
			}

			// 获取当前所有实时图层的ID集合映射
			const liveLayerIds = storage.get('layerIds')
			// 创建唯一id
			const layerId = nanoid()
			// 创建新的图层对象
			const layer = new LiveObject({
				type: layerType,
				x: position.x,
				y: position.y,
				width: 100,
				height: 100,
				fill: lastUsedColor,
			})
			// 更新id集合
			liveLayerIds.push(layerId)
			// 更新映射集合
			liveLayers.set(layerId, layer)

			// 更新当前用户的活动状态 默认选中新创建的图层 并将此更改添加到历史记录中
			setMyPresence({ selection: [layerId] }, { addToHistory: true })

			// 更新当前画板操作模式
			setCanvasState({
				mode: CanvasMode.None,
			})
		},
		[lastUsedColor]
	)

	/**
	 * 主要负责响应用户对选中图层的拖拽操作，根据拖拽的距离改变选中图层的位置，并实时更新画布状态以反映这些变化
	 */
	const translateSelectedLayers = useMutation(
		({ storage, self }, point: Point) => {
			if (canvasState.mode !== CanvasMode.Translating) return

			// 利用当前鼠标位置和之前鼠标位置的差值 计算图层的偏移量
			const offset = {
				x: point.x - canvasState.current.x,
				y: point.y - canvasState.current.y,
			}
			// 获取图层映射 id-图层对象
			const liveLayers = storage.get('layers')

			// 遍历当前用户所选中的图层id集合
			for (const id of self.presence.selection) {
				// 根据id从图层映射中提取出图层对象
				const layer = liveLayers.get(id)
				// 更新其坐标
				if (layer) {
					layer.update({
						x: layer.get('x') + offset.x,
						y: layer.get('y') + offset.y,
					})
				}
			}
			// 更新画板操作状态
			setCanvasState({
				mode: CanvasMode.Translating,
				current: point,
			})
		},
		[canvasState]
	)

	/**
	 * 主要负责取消图层选中
	 */
	const unSelectLayers = useMutation(({ self, setMyPresence }) => {
		// 判断当前用户是否选中了图层 如果选中了图层 若选中 则更新对应数据 取消选中
		if (self.presence.selection.length > 0) {
			setMyPresence(
				{ selection: [] },
				{
					addToHistory: true,
				}
			)
		}
	}, [])

	/**
	 * 主要用于实际处理图层缩放/更新操作,
	 */
	const resizeSelectedLayer = useMutation(
		({ storage, self }, point: Point) => {
			if (canvasState.mode !== CanvasMode.Resizing) return

			// 获取新的图层边界/大小数据
			const bounds = resizeBounds(
				canvasState.initialBounds,
				canvasState.corner,
				point
			)

			const liveLayer = storage.get('layers')
			// 获取图层对象
			const layer = liveLayer.get(self.presence.selection[0])

			if (layer) {
				// 更新
				layer.update(bounds)
			}
		},
		[canvasState]
	)

	/**
	 * 主要用于响应用户对图层的缩放操作,当用户点击缩放控件时，会触发onPointerDown事件，从而开始缩放图层。
	 */
	const onResizeHandlePointerDown = useCallback(
		(corner: Side, initialBounds: XYWH) => {
			/* 
				按下鼠标进行缩放时 调用history.pause() 会暂停历史记录功能
				当onPointerUp触发时，history.resume() 会恢复历史记录功能
				从而将图层缩放的所有过程整合在一起  仅创建一个历史记录 即该历史记录着图层初始状态 到 缩放完毕的过程
				*/
			history.pause()

			// 设置画布状态 初始边界 缩放控件方向
			setCanvasState({
				mode: CanvasMode.Resizing,
				initialBounds,
				corner,
			})
		},
		[history]
	)

	/**
	 * 用于检测用户是否试图进行多选操作的回调函数，在满足特定移动距离条件时，切换至多选网络模式并记录相关坐标信息。
	 */
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
	/**
	 * 在画布处于多选网络模式时，负责根据用户鼠标移动更新选中图层的状态信息，并将这些信息同步到全局状态或用户的上下文信息中。
	 */
	const updateSelectionNet = useMutation(
		({ storage, setMyPresence }, current: Point, origin: Point) => {
			// 获取当前所有的实时图层对象信息
			const layers = storage.get('layers').toImmutable()
			// 确保画布始终保持在多选网络模式下
			setCanvasState({
				mode: CanvasMode.SelectionNet,
				current,
				origin,
			})
			// 获取区域选择框中包含的图层id集合
			const ids = findInterselectingLayerWithRectangle(
				layerIds,
				layers,
				origin,
				current
			)
			// 更新当前用户的图层选中数据
			setMyPresence({ selection: ids })
		},
		[layerIds]
	)

	/**
	 * 在正式进行绘画操作之前的预处理
	 */
	const startDrawing = useMutation(
		({ setMyPresence }, point: Point, pressure: number) => {
			// 更新当前用户的画笔数据 画笔起始点 压力值 画笔颜色
			setMyPresence({
				pencilDraft: [[point.x, point.y, pressure]],
				penColor: lastUsedColor,
			})
		},
		[lastUsedColor]
	)

	/**
	 * 主要负责处理绘画过程中的相关处理 如 记录用户的绘画轨迹
	 */
	const continueDrawing = useMutation(
		({ self, setMyPresence }, point: Point, e: React.PointerEvent) => {
			// 获取绘画草稿
			const { pencilDraft } = self.presence

			// e.buttons 表示当前鼠标按下的状态 为只读属性
			if (
				canvasState.mode !== CanvasMode.Pencil ||
				e.buttons !== 1 ||
				pencilDraft == null
			) {
				// 如果当前画板操作不是画笔模式 或者 鼠标没有左键按下 或者 画笔相关数据为空 直接返回
				return
			}
			/* pencilDraft.length === 1 &&
					pencilDraft[0][0] === point.x &&
					pencilDraft[0][1] === point.y 用于判断当前画笔是否真正被使用 
				若pencilDraft中的长度为1 且pencilDraft中的坐标与当前坐标相同 则说明当前画笔处于未使用状态 直接返回
				反之则 将新坐标点和压力值加入到绘画草稿中，以记录用户的绘画轨迹。确保不会重复记录
			*/
			setMyPresence({
				cursor: point,
				pencilDraft:
					pencilDraft.length === 1 &&
					pencilDraft[0][0] === point.x &&
					pencilDraft[0][1] === point.y
						? pencilDraft
						: [...pencilDraft, [point.x, point.y, e.pressure]],
			})
		},
		[canvasState.mode]
	)

	/**
	 * 插入绘画图层
	 */
	const insertPath = useMutation(
		({ storage, self, setMyPresence }) => {
			// 获取图层映射关系
			const liveLayers = storage.get('layers')
			//获取绘画草稿数据
			const { pencilDraft } = self.presence

			// 检查以下条件是否满足以确定是否应插入路径：
			// - 用户的绘画草稿存在。
			// - 绘画草稿中的点数量大于等于2（至少需要两个点来定义一条路径）。
			// - 当前活动图层的数量未达到最大限制（MAX_LAYERS）。
			if (
				pencilDraft == null ||
				pencilDraft.length < 2 ||
				liveLayers.size >= MAX_LAYERS
			) {
				// 如果不满足条件 清空绘画草稿数据
				setMyPresence({ pencilDraft: null })
				return
			}

			// 创建唯一id
			const id = nanoid()

			// 更新图层映射关系
			liveLayers.set(
				id,
				new LiveObject(penPointsToPathLayer(pencilDraft, lastUsedColor))
			)
			// 更新图层id集合
			const liveLayerIds = storage.get('layerIds')
			liveLayerIds.push(id)

			// 清空绘画草稿数据
			setMyPresence({ pencilDraft: null })

			// 将画布模式重置为 'Pencil' 模式，以便用户可以继续进行绘画操作。
			setCanvasState({ mode: CanvasMode.Pencil })
		},
		[lastUsedColor]
	)

	/**
	 * 创建一个使用`useCallback`优化的滚轮事件处理函数。避免在每次滚动事件触发时都重新创建一个函数。优化性能
	 * @param e 滚轮事件对象
	 * 核心逻辑：
	 * 当滚轮事件触发时，更新相机对象的位置。通过回调函数接收当前的相机状态，并根据滚轮事件的水平（deltaX）和垂直（deltaY）滚动量调整相机的x和y坐标。
	 * - 相机x坐标：减去滚轮事件的水平滚动值（deltaX）
	 * - 相机y坐标：减去滚轮事件的垂直滚动值（deltaY）
	 *
	 * 依赖项为空数组，意味着此回调函数在组件生命周期内不会因任何props或state变化而改变，提高性能。
	 */
	const onWheel = useCallback((e: React.WheelEvent) => {
		setCamera((camera) => ({
			x: camera.x - e.deltaX,
			y: camera.y - e.deltaY,
		}))
	}, [])

	/**
 * `onPointerMove` 是一个通过 `useMutation` 钩子创建的 React 回调函数，该函数会在全局触发 PointerMove 事件（如鼠标移动或触摸滑动）时执行。它接收一个包含 setMyPresence 方法的对象和一个 React.PointerEvent 参数 e。
 *
 * 函数的主要逻辑如下:
 * 1. 阻止 PointerMove 事件的默认行为（e.preventDefault()），以确保在应用自定义交互时不产生意外效果。
 * 2. 将 PointerEvent 转换为相对于画布坐标的当前点（current），使用 pointerEventToCanvasPoint 函数和 camera 参数进行坐标转换。
 * 3. 根据当前画布状态（canvasState.mode）执行不同操作:
   - 如果模式为 'Pressing'，则开始多选操作（startMultiSelection），更新选区范围从 canvasState.origin 开始到当前点 current 结束。
   - 如果模式为 'SelectionNet'，则更新选择网（updateSelectionNet），用户可能正在拖拽选择区域边界以扩大或缩小选择范围，current 是当前位置，canvasState.origin 是起始位置。
   - 如果模式为 'Translating'，调用 translateSelectedLayers 函数平移已选中的图层至当前点 current 的位置上。
   - 如果模式为 'Resizing'，调用 resizeSelectedLayer 函数根据当前点 current 更新所选中图层的大小和位置，实现缩放功能。
   - 如果模式为 'Pencil'，调用 continueDrawing 函数继续绘制路径，将当前点 current 添加到路径数据中，同时传入原始事件对象 e 可能用于获取更多与绘图相关的参数，如压力、倾斜度等（如果支持的话）。
 * 4. 不论处于何种模式，都会设置用户的当前光标位置（cursor）为当前点 current，这可以通过 setMyPresence 方法来实现并将结果存储到上下文中。
 */
	const onPointerMove = useMutation(
		({ setMyPresence }, e: React.PointerEvent) => {
			/*  阻止页面滚动或任何与元素默认交互相关的行为，
			 确保用户在进行自定义操作时不会出现意外的页面滚动或其他非预期效果。 */
			e.preventDefault()

			// 获取鼠标的实际坐标点
			const current = pointerEventToCanvasPoint(e, camera)

			switch (canvasState.mode) {
				case CanvasMode.Pressing:
					startMultiSelection(current, canvasState.origin)
					break
				case CanvasMode.SelectionNet:
					updateSelectionNet(current, canvasState.origin)
					break
				case CanvasMode.Translating:
					console.log('LayerTranslating')
					translateSelectedLayers(current)
					break
				case CanvasMode.Resizing:
					resizeSelectedLayer(current)
					break
				case CanvasMode.Pencil:
					continueDrawing(current, e)
					break
			}

			setMyPresence({ cursor: current })
		},
		[camera, canvasState, resizeSelectedLayer, translateSelectedLayers]
	)

	/**
	 * 监听光标离开事件 当用户鼠标离开页面时，清除用户的光标位置。
	 */
	const onPointerLeave = useMutation(({ setMyPresence }) => {
		setMyPresence({ cursor: null })
	}, [])

	/**
	 * 定义一个使用`useCallback`优化过的指针按下事件处理函数。
	 * @param e React的PointerEvent对象，表示用户在组件上触发了指针按下事件。
	 *
	 * 核心逻辑：
	 * 1. 调用`pointerEventToCanvasPoint`函数，将实际触发事件的坐标点转换为基于画布坐标的点（point）。
	 * 2. 判断当前canvasState.mode的状态：
	 *   a) 如果模式为`CanvasMode.Inserting`，输出“Inserting”日志，并结束函数执行。
	 *   b) 若模式为`CanvasMode.Pencil`，调用`startDrawing`函数开始绘图，传入转换后的点坐标和指针事件的压力值（pressure），并结束函数执行。
	 *   c) 其他情况下，更新canvasState状态，设置新的原点坐标为当前点（origin: point），并将模式更改为`CanvasMode.Pressing`。
	 *
	 * 使用`useCallback`确保当依赖项数组中的任何一个值发生变化时才会重新创建此回调函数，避免不必要的性能损失。
	 */
	const onPointerDown = useCallback(
		(e: React.PointerEvent) => {
			// 获取鼠标按下时 其实际坐标点
			const point = pointerEventToCanvasPoint(e, camera)

			switch (canvasState.mode) {
				case CanvasMode.Inserting:
					console.log('Inserting')
					return
				case CanvasMode.Pencil:
					// e.pressure 代表指针事件压力值，用于控制笔触的粗细
					console.log('start Drawing')
					startDrawing(point, e.pressure)
					return
			}

			setCanvasState({
				origin: point,
				mode: CanvasMode.Pressing,
			})
		},
		[camera, canvasState.mode, setCanvasState, startDrawing]
	)

	/**
 * `onPointerUp` 是一个通过 `useMutation` 钩子创建的 React 回调函数，该函数会在全局触发 PointerUp 事件（如鼠标抬起或触摸结束）时执行。它接收一个空对象和一个 React.PointerEvent 参数 e。
 *
 * 函数的主要逻辑如下:
 * 1. 将 PointerEvent 转换为相对于画布坐标的点（point），使用了 pointerEventToCanvasPoint 函数和 camera 参数进行坐标转换。
 * 2. 根据当前画布状态（canvasState.mode）进行不同操作:
   - 如果模式为 'None' 或 'Pressing'，则清除所有选中图层（unSelectLayers），将画布模式重置为 'None'，并在控制台打印 'Unselect' 日志信息。
   - 如果模式为 'Pencil'，调用 insertPath 函数插入绘制路径数据（可能代表用户在画布上完成了一次手绘操作）。
   - 如果模式为 'Inserting'，根据 canvasState.layerType 插入新图层到指定位置（point）上，并传入相应的 layer 类型和坐标点参数给 insertLayer 函数处理。
   - 对于其他未定义的默认情况，将画布模式重置为 'None'。
 * 3. 在所有操作完成后恢复历史记录的更新（history.resume()），允许再次记录后续的操作变更到历史记录中。
 */
	const onPointerUp = useMutation(
		({}, e: React.PointerEvent) => {
			// 获取鼠标抬起时 其实际坐标点
			const point = pointerEventToCanvasPoint(e, camera)

			// 根据画板操作状态作出对应处理
			switch (canvasState.mode) {
				case CanvasMode.None || CanvasMode.Pressing:
					console.log('Unselect')
					unSelectLayers()
					setCanvasState({
						mode: CanvasMode.None,
					})
					break
				case CanvasMode.Pencil:
					insertPath()
					break
				case CanvasMode.Inserting:
					insertLayer(canvasState.layerType, point)
					break
				default:
					setCanvasState({
						mode: CanvasMode.None,
					})
					break
			}
			// 在所有操作完成后恢复历史记录的更新（history.resume()），允许再次记录后续的操作变更到历史记录中。
			history.resume()
		},
		[camera, canvasState, history, insertLayer, setCanvasState, insertPath]
	)

	/**
	 * 主要负责处理画板中点击图层的选中操作处理
	 *
	 * 函数的主要逻辑如下:
	 * 1. 检查当前画布模式（canvasState.mode），如果处于 'Pencil' 或 'Inserting' 模式，则直接返回，不进行后续操作。
	 * 2. 暂停历史记录操作（history.pause()），以防止在此期间记录不必要的中间状态变更。
	 * 3. 停止事件冒泡（e.stopPropagation()），确保事件不会影响到父级元素。
	 * 4. 将 PointerEvent 转换为相对于画布坐标的点（point）, 使用了 pointerEventToCanvasPoint 函数和 camera 参数进行坐标转换。
	 * 5. 如果当前用户的 presence.selection 中不包含触发事件的 layerId，则更新用户在画布上的选区，仅包含当前 layerId，并将此变更添加到历史记录（addToHistory: true）。
	 * 6. 更新画布状态（setCanvasState），将画布模式切换至 'Translating'（平移模式），并将当前指针位置设置为初始移动参照点（current: point）。
	 */
	const onLayerPointerDown = useMutation(
		({ self, setMyPresence }, e: React.PointerEvent, layerId: string) => {
			if (
				canvasState.mode === CanvasMode.Pencil ||
				canvasState.mode === CanvasMode.Inserting
			) {
				return
			}

			// 暂停历史记录功能 搭配onPointerUp事件 将缩放过程整合成一个历史记录
			history.pause()

			// 阻止事件冒泡
			e.stopPropagation()

			// 获取鼠标按下时 其实际坐标点
			const point = pointerEventToCanvasPoint(e, camera)

			/* 判断当前用户是否已选中该图层，若已选中则不作额外处理 
			 反之则更新用户在画布上的选区，仅包含当前 layerId。表示选中该图层 */
			if (!self.presence.selection.includes(layerId)) {
				setMyPresence({ selection: [layerId] }, { addToHistory: true })
			}

			// 更新画板操作状态
			setCanvasState({
				mode: CanvasMode.Translating,
				current: point,
			})

			console.log('Translating Mode')
		},
		[setCanvasState, camera, history, canvasState.mode]
	)

	// 获取其他用户的模块选中情况 并订阅数据变更
	const selections = useOthersMapped((other) => other.presence.selection)
	/**
	 * 用于构建画板中其他用户选中图层时，图层及其边框颜色的映射关系 （selectionColor）
	 */
	const layerIdsToColorsSelection = useMemo(() => {
		// 用于存储图层ID 和 颜色的映射关系
		const layerIdsToColorsSelection: Record<string, string> = {}

		for (const user of selections) {
			const [connectionId, selection] = user
			for (const layerId of selection) {
				layerIdsToColorsSelection[layerId] = connectionIdToColor(connectionId)
			}
		}

		return layerIdsToColorsSelection
	}, [selections])

	const deleteLayers = useDeleteLayers()

	// 配置快捷键
	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			switch (e.key) {
				/* 	case 'Backspace':
					deleteLayers()
					break */
				case 'z':
					if (e.ctrlKey || e.metaKey) {
						if (e.shiftKey) {
							history.redo
						} else {
							history.undo()
						}
						break
					}
			}
		}
		document.addEventListener('keydown', onKeyDown)
		return () => {
			document.removeEventListener('keydown', onKeyDown)
		}
	}, [deleteLayers, history])

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
					// 通过移动图层位置 从而实现视觉上的 画板相对容器的平移效果
					style={{
						transform: `translate(${camera.x}px, ${camera.y}px)`,
					}}>
					{/* 根据实时图层id集合，渲染图层预览 */}
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
					{/* 画笔移动痕迹显示 */}
					{pencilDraft !== null && pencilDraft.length > 0 && (
						<Path
							points={pencilDraft}
							fill={colorToCss(lastUsedColor)}
							x={0}
							y={0}
						/>
					)}
				</g>
			</svg>
		</main>
	)
}

export default Canvas
