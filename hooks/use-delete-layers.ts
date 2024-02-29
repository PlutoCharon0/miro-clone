import { useMutation, useSelf } from '@/liveblocks.config'

/**
 * 执行图层删除操作处理
 */
export const useDeleteLayers = () => {
	// 获取当前选中的图层id集合
	const selection = useSelf((me) => me.presence.selection)

	return useMutation(
		({ storage, setMyPresence }) => {
			// 获取图层映射关系
			const liveLayers = storage.get('layers')
			// 获取图层id集合
			const liveLayersIds = storage.get('layerIds')

			// 遍历选中的图层id集合
			for (const id of selection) {
				// 在图层映射中删除对应id图层映射
				liveLayers.delete(id)
				// 查找此图层 ID 在 liveLayersIds 列表中的索引
				const index = liveLayersIds.indexOf(id)
				// 如果找到了（即索引不为 -1），则从列表中删除该图层 ID。
				if (index !== -1) {
					liveLayersIds.delete(index)
				}
			}
			// 更新状态数据
			setMyPresence({ selection: [] }, { addToHistory: true })
		},
		[selection]
	)
}
