import { shallow } from '@liveblocks/client'

import { Layer, XYWH } from '@/types/canvas'
import { useSelf, useStorage } from '@/liveblocks.config'

/**
 * 计算图层边界框的函数，输入为一个 Layer 类型数组，输出为包含左上角坐标与宽高的 XYWH 对象或 null（当输入数组为空时）。
 * @param layers - 一系列具有 x、y、width 和 height 属性的图层对象数组
 * @returns {XYWH | null} - 返回一个表示所有图层层叠后形成的最小边界框的对象，或者当图层列表为空时返回 null
 */
const boundingBox = (layers: Layer[]): XYWH | null => {
	const first = layers[0]

	if (!first) {
		return null
	}
	// 初始化
	let left = first.x
	let right = first.x + first.width
	let top = first.y
	let bottom = first.y + first.height

	/* 这段代码的主要目的是遍历一个包含多个图层信息的数组，并计算这些图层层叠后的最小外接矩形（边界框）。初始化时，我们使用第一个图层的坐标和尺寸来设置边界框。然后从第二个图层开始逐个检查剩余图层的边界信息。
	对于每个图层，分别对比其左、右、上、下边界与当前边界框的相应边界值。
	如果发现当前图层的某个边界小于或大于边界框的对应边界，则更新边界框的边界值以确保它始终能够包围所有已遍历过的图层。
	最终通过不断迭代和比较，得到整个图层层叠之后形成的最小边界框。 */
	for (let i = 1; i < layers.length; i++) {
		const { x, y, width, height } = layers[i]

		// 如果当前图层的左边界小于原始边界框的左边界，则更新边界框的边界值
		if (x < left) {
			left = x
		}
		// 如果当前图层的右边界大于原始边界框的右边界，则更新边界框的边界值
		if (x + width > right) {
			right = x + width
		}
		// 如果当前图层的上边界大于原始边界框的上边界，则更新边界框的边界值
		if (y < top) {
			top = y
		}
		// 如果当前图层的下边界大于原始边界框的下边界，则更新边界框的边界值
		if (y + height > bottom) {
			bottom = y + height
		}
	}

	// 计算并返回最终的边界框对象，其宽高为左右、上下坐标的差值
	return {
		x: left,
		y: top,
		width: right - left,
		height: bottom - top,
	}
}
/**
 * 用于确保当选中图层发生变化时，能实时更新最小外接图层边框的信息。
 * @returns 返回一个表示所有图层层叠后形成的最小边界框的对象，
 */
export const useSelectionBounds = () => {
	console.log('get minimum Bounds')
	
	// 获取当前用户选择的图层(id)集合
	const selection = useSelf((me) => me.presence.selection)

	return useStorage((root) => {
		// 根据选择的图层id集合，获取实际图层对象
		const selectionLayers = selection
			.map((layerId) => root.layers.get(layerId)!)
			.filter(Boolean)

		return boundingBox(selectionLayers)
	}, shallow) // shallow配置 开启浅层比较
}
