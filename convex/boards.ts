// 存储数据的查询操作
import { v } from 'convex/values'
import { query } from './_generated/server'
import { getAllOrThrow } from 'convex-helpers/server/relationships'
export const get = query({
	args: {
		orgId: v.string(),
		search: v.optional(v.string()),
		favorites: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()

		if (!identity) {
			throw new Error('Unanthorized')
		}
		const userId = identity.subject

		const title = args.search as string

		if (args.favorites) {
			const favoritedBoards = await ctx.db
				.query('userFavorites')
				.withIndex('by_user_org', (q) =>
					q.eq('userId', userId).eq('orgId', args.orgId)
				)
				.order('desc')
				.collect()

			const ids = favoritedBoards.map((f) => f.boardId)

			const boards = await getAllOrThrow(ctx.db, ids)

			return boards.map((board) => ({
				...board,
				isFavorite: true,
			}))
		}

		let boards = []

		if (title) {
			// 指定查询
			boards = await ctx.db
				.query('boards')
				.withSearchIndex('search_title', (q) =>
					q.search('title', title).eq('orgId', args.orgId)
				)
				.collect()
		} else {
			// 查询所有画板列表数据
			boards = await ctx.db
				.query('boards')
				.withIndex('by_org', (q) => q.eq('orgId', args.orgId))
				.order('desc')
				.collect()
		}

		const boardsWithFavoriteRelation = boards.map((board) => {
			// 通过查询 userFavorites表 查找当前画板是否是被被点击为喜欢
			return ctx.db
				.query('userFavorites')
				.withIndex('by_user_board', (q) =>
					q.eq('userId', userId).eq('boardId', board._id)
				)
				.unique()
				.then((favoriite) => {
					// 完善配置数据体
					return {
						...board,
						isFavorite: !!favoriite,
					}
				})
		})

		const boardsWithFavoriteBoolean = Promise.all(boardsWithFavoriteRelation)

		return boardsWithFavoriteBoolean
	},
})
