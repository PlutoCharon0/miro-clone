import { v } from 'convex/values'

import { mutation, query } from './_generated/server'

// 存储对于数据体的增删改操作

const images = [
	'/placeholders/1.svg',
	'/placeholders/2.svg',
	'/placeholders/3.svg',
	'/placeholders/4.svg',
	'/placeholders/5.svg',
	'/placeholders/6.svg',
	'/placeholders/7.svg',
	'/placeholders/8.svg',
	'/placeholders/9.svg',
	'/placeholders/10.svg',
]
// 创建画板
export const create = mutation({
	args: {
		orgId: v.string(),
		title: v.string(),
	},
	handler: async (ctx, args) => {
		// 后端身份验证
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) {
			throw new Error('Unanthorized')
		}

		const randomImage = images[Math.floor(Math.random() * images.length)]

		// 创建数据体
		const board = await ctx.db.insert('boards', {
			title: args.title,
			orgId: args.orgId,
			authorId: identity.subject,
			authorName: identity.name!,
			imageUrl: randomImage,
		})
		return board
	},
})

// 移除画板
export const remove = mutation({
	args: {
		id: v.id('boards'),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) {
			throw new Error('Unanthorized')
		}
		const userId = identity.subject

		const existingFavorite = await ctx.db
			.query('userFavorites')
			.withIndex('by_user_board', (q) =>
				q.eq('userId', userId).eq('boardId', args.id)
			)
			.unique()

		if (existingFavorite) {
			await ctx.db.delete(existingFavorite._id)
		}

		await ctx.db.delete(args.id)
	},
})

// 更新画板名称
export const update = mutation({
	args: {
		id: v.id('boards'),
		title: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) {
			throw new Error('Unanthorized')
		}

		if (!args.title) {
			throw new Error('Title is required')
		}

		if (args.title.length > 60) {
			throw new Error('Title connnot be longer than 60 characters')
		}

		const board = await ctx.db.patch(args.id, {
			title: args.title,
		})
		return board
	},
})

// 点击喜欢
export const favorite = mutation({
	args: {
		id: v.id('boards'),
		orgId: v.string(),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) {
			throw new Error('Unanthorized')
		}

		const board = await ctx.db.get(args.id)

		if (!board) {
			throw new Error('Board not found')
		}
		const userId = identity.subject

		const existingFavorite = await ctx.db
			.query('userFavorites')
			.withIndex('by_user_board_org', (q) =>
				q.eq('userId', userId).eq('boardId', board._id).eq('orgId', args.orgId)
			)
			.unique()

		if (existingFavorite) {
			throw new Error('Board already favorite')
		}

		await ctx.db.insert('userFavorites', {
			userId,
			boardId: board._id,
			orgId: args.orgId,
		})
		return board
	},
})

// 取消喜欢
export const unfavorite = mutation({
	args: {
		id: v.id('boards'),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) {
			throw new Error('Unanthorized')
		}

		const board = await ctx.db.get(args.id)

		if (!board) {
			throw new Error('Board not found')
		}
		const userId = identity.subject

		const existingFavorite = await ctx.db
			.query('userFavorites')
			.withIndex('by_user_board', (q) =>
				q.eq('userId', userId).eq('boardId', board._id)
			)
			.unique()

		if (!existingFavorite) {
			throw new Error('Favorite board not found')
		}

		await ctx.db.delete(existingFavorite._id)

		return board
	},
})

// 查找指定id的画板
export const get = query({
	args: {
		id: v.id('boards'),
	},
	handler: async (ctx, args) => {
		const board = ctx.db.get(args.id)
		return board
	},
})
