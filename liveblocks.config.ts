import { createClient, LiveList, LiveMap, LiveObject } from '@liveblocks/client'
import { createRoomContext } from '@liveblocks/react'

import { Layer, Color } from './types/canvas'

const client = createClient({
	throttle: 16,
	// 配置身份验证的"终结点"
	authEndpoint: '/api/liveblocks-auth',

	/*
	用于创建客户端负责与后端进行通信
	publicApiKey:
		'pk_dev_WOFdmmy8rS1MUzaeHQAfoa1f4ClNnQ5Gr30cne7KJY44Gz2g5jAfqPQXxi_EtCwk' */
})

// Presence represents the properties that exist on every user in the Room
// and that will automatically be kept in sync. Accessible through the
// `user.presence` property. Must be JSON-serializable.
type Presence = {
	cursor: { x: number; y: number } | null // 定义光标位置
	selection: string[] // 用于存储选中的图层id集合
	pencilDraft: [x: number, y: number, pressure: number][] | null
	penColor: Color | null
	// ...
}

// Optionally, Storage represents the shared document that persists in the
// Room, even after all users leave. Fields under Storage typically are
// LiveList, LiveMap, LiveObject instances, for which updates are
// automatically persisted and synced to all connected clients.
// 用于表示在实时协作应用中共享且持久化的文档结构。
// 这个文档即使在所有用户离开后也会保留在房间（Room）中。
type Storage = {
	// 当对这些Layer对象进行更新时，变化会自动保存并同步到所有已连接的客户端。
	layers: LiveMap<string, LiveObject<Layer>>, // 存储图层类映射 键为id，值为图层类型
	// 每当添加、删除或重新排序图层时，该列表都会自动更新并在所有客户端之间保持同步。
	layerIds: LiveList<string> // 存储图层id列表
}

// Optionally, UserMeta represents static/readonly metadata on each user, as
// provided by your own custom auth back end (if used). Useful for data that
// will not change during a session, like a user's name or avatar.
type UserMeta = {
	id?: string
	info?: {
		name?: string
		picture?: string
	}
}

// Optionally, the type of custom events broadcast and listened to in this
// room. Use a union for multiple events. Must be JSON-serializable.
type RoomEvent = {
	// type: "NOTIFICATION",
	// ...
}

// Optionally, when using Comments, ThreadMetadata represents metadata on
// each thread. Can only contain booleans, strings, and numbers.
export type ThreadMetadata = {
	// resolved: boolean;
	// quote: string;
	// time: number;
}

export const {
	suspense: {
		RoomProvider,
		useRoom,
		useMyPresence,
		useUpdateMyPresence,
		useSelf,
		useOthers,
		useOthersMapped,
		useOthersConnectionIds,
		useOther,
		useBroadcastEvent,
		useEventListener,
		useErrorListener,
		useStorage,
		useObject,
		useMap,
		useList,
		useBatch,
		useHistory,
		useUndo,
		useRedo,
		useCanUndo,
		useCanRedo,
		useMutation,
		useStatus,
		useLostConnectionListener,
		useThreads,
		useUser,
		useCreateThread,
		useEditThreadMetadata,
		useCreateComment,
		useEditComment,
		useDeleteComment,
		useAddReaction,
		useRemoveReaction,
	},
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata>(
	client,
	{
		async resolveUsers({ userIds }) {
			// Used only for Comments. Return a list of user information retrieved
			// from `userIds`. This info is used in comments, mentions etc.

			// const usersData = await __fetchUsersFromDB__(userIds);
			//
			// return usersData.map((userData) => ({
			//   name: userData.name,
			//   avatar: userData.avatar.src,
			// }));

			return []
		},
		async resolveMentionSuggestions({ text, roomId }) {
			// Used only for Comments. Return a list of userIds that match `text`.
			// These userIds are used to create a mention list when typing in the
			// composer.
			//
			// For example when you type "@jo", `text` will be `"jo"`, and
			// you should to return an array with John and Joanna's userIds:
			// ["john@example.com", "joanna@example.com"]

			// const userIds = await __fetchAllUserIdsFromDB__(roomId);
			//
			// Return all userIds if no `text`
			// if (!text) {
			//   return userIds;
			// }
			//
			// Otherwise, filter userIds for the search `text` and return
			// return userIds.filter((userId) =>
			//   userId.toLowerCase().includes(text.toLowerCase())
			// );

			return []
		},
	}
)
