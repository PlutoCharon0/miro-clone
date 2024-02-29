import {
	Camera,
	Color,
	Layer,
	LayerType,
	PathLayer,
	Point,
	Side,
	XYWH,
} from '@/types/canvas'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

const COLORS = ['#DC2626', '#D97706', '#059669', '#7C3AED', '#DB2777']

/**
 * 根据连接ID选择返回对应颜色
 * @param connectionId 连接ID
 * @returns 颜色字符串
 */
export function connectionIdToColor(connectionId: number): string {
	return COLORS[connectionId % COLORS.length]
}

/**
 * 根据鼠标在视图窗口中的坐标转换为Canvas元素中的坐标系
 * @param e 指针事件对象
 * @param camera 相机对象 表示Canvas元素在浏览器视图窗口的偏移量
 * @returns 画布上的坐标点对象
 */
export function pointerEventToCanvasPoint(
	e: React.PointerEvent,
	camera: Camera
) {
	return {
		x: Math.round(e.clientX) - camera.x,
		y: Math.round(e.clientY) - camera.y,
	}
}

export function colorToCss(color: Color) {
	return `#${color.r.toString(16).padStart(2, '0')}${color.g
		.toString(16)
		.padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`
}

/**
 * 根据原始边界和缩放后的角点位置计算新的边界位置/图层大小
 * @param bounds 原始边界
 * @param corner 角点类型
 * @param point 缩放后的角点位置
 * @returns 新的边界位置
 */
export function resizeBounds(bounds: XYWH, corner: Side, point: Point): XYWH {
	console.log('get new ResizeData')

	// 创建一个新的边界对象
	const result = {
		x: bounds.x,
		y: bounds.y,
		width: bounds.width,
		height: bounds.height,
	}

	if ((corner & Side.Left) === Side.Left) {
		/* 比较缩放后的角点位置的x值 与 原边界框右边界位置值 
		前者小则说明缩放方向向左 后者小则说明缩放方向向右  */
		result.x = Math.min(point.x, bounds.x + bounds.width)
		/* 通过原边界框的右边界减去新的左边界坐标得到的差值，并取绝对值确保宽度始终为正数
		从而实现根据拖动左边界的点来动态调整边界框大小的功能。*/
		result.width = Math.abs(bounds.x + bounds.width - point.x)
	}

	if ((corner & Side.Right) === Side.Right) {
		result.x = Math.min(point.x, bounds.x)
		result.width = Math.abs(point.x - bounds.x)
	}

	if ((corner & Side.Top) === Side.Top) {
		/* 比较缩放后的角点位置的y值 与 原边界框上边界位置值 
		前者小则说明缩放方向向上 后者小则说明缩放方向向下  */
		result.y = Math.min(point.y, bounds.y + bounds.height)
		/* 通过原边界框的上边界减去新的上边界坐标得到的差值，并取绝对值确保宽度始终为正数
		从而实现根据拖动上边界的点来动态调整边界框大小的功能。*/
		result.height = Math.abs(bounds.y + bounds.height - point.y)
	}

	if ((corner & Side.Bottom) === Side.Bottom) {
		result.y = Math.min(point.y, bounds.y)
		result.height = Math.abs(point.y - bounds.y)
	}

	return result
}

/**
 * 用于查找与指定矩形相交的图层ID
 * @param layerIds 图层ID数组
 * @param layers 图层映射关系
 * @param a 起始点坐标
 * @param b 鼠标移动坐标
 * @returns 与区域选择框相交的图层的对应ID数组
 */
export function findInterselectingLayerWithRectangle(
	layerIds: readonly string[],
	layers: ReadonlyMap<string, Layer>,
	a: Point,
	b: Point
) {
	// 获取区域选择框的相关范围数据
	const rect = {
		x: Math.min(a.x, b.x),
		y: Math.min(a.y, b.y),
		width: Math.abs(a.x - b.x),
		height: Math.abs(a.y - b.y),
	}
	// 初始化一个空数组，用于存储与矩形相交的图层ID
	const ids = []

	for (const layerId of layerIds) {
		const layer = layers.get(layerId)

		if (layer == null) {
			continue
		}
		// 获取图层对象中的位置和尺寸属性
		const { x, y, width, height } = layer

		// 判断当前图层是否与计算出的矩形相交
		if (
			rect.x + rect.width > x &&
			rect.x < x + width &&
			rect.y + rect.height > y &&
			rect.y < y + height
		) {
			ids.push(layerId)
		}
	}
	return ids
}

/**
 * 获取与给定颜色形成对比的文本颜色
 * @param color 给定的颜色
 * @returns 对比的文本颜色
 */
export function getContrastingTextColor(color: Color) {
	const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b
	return luminance > 182 ? 'black' : 'white'
}

/**
 * 用于将二维数组形式的点数据转换为一个路径图层对象
 * @param points 二维数组形式的点数据
 * @param color 画笔颜色
 */
export function penPointsToPathLayer(
	points: number[][],
	color: Color
): PathLayer {
	if (points.length < 2) {
		throw new Error('Cannot transform points with less than points')
	}
	// 用于确定路径图层的位置（左上角坐标）以及尺寸（宽度和高度）。
	let left = Number.POSITIVE_INFINITY // 最小x坐标
	let top = Number.POSITIVE_INFINITY // 最小y坐标
	let right = Number.NEGATIVE_INFINITY // 最大x坐标
	let bottom = Number.NEGATIVE_INFINITY // 最大y坐标

	/* 	遍历输入数组 points 中的所有点，并通过比较更新这四个变量的值。
	这样做的目的是计算出包含所有点的边界框（bounding box）或最小外接矩形的坐标范围。 */
	for (const point of points) {
		const [x, y] = point
		if (left > x) {
			left = x
		}
		if (top > y) {
			top = y
		}
		if (right < x) {
			right = x
		}
		if (bottom < y) {
			bottom = y
		}
	}

	// 返回图层对象
	return {
		type: LayerType.Path,
		x: left,
		y: top,
		width: right - left,
		height: bottom - top,
		fill: color,
		points: points.map(([x, y, pressure]) => [x - left, y - top, pressure]),
	}
}

/**
 * 根据给定的stroke数组生成SVG路径字符串
 * @param stroke 路径点嵌套数组 每个子数组表示路径上的一个点的坐标
 * @returns SVG路径字符串
 */
export function getSvgPathFromStroke(stroke: number[][]) {
	if (!stroke.length) return ''
	/* 	使用reduce方法将stroke数组中的点连接起来生成路径字符串。 
	路径径字符串的格式为'M'表示移动到起始点，'Q'表示使用贝塞尔曲线连接两个点，'Z'表示闭合路径。 */
	const d = stroke.reduce(
		(acc, [x0, y0], i, arr) => {
			const [x1, y1] = arr[(i + 1) % arr.length]
			acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
			return acc
		},
		['M', ...stroke[0], 'Q']
	)

	d.push('Z')
	return d.join(' ')
}
