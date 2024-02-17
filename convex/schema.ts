import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
// https://docs.convex.dev/database

// 创建数据表结构
export default defineSchema({
  boards: defineTable({
    title: v.string(),
    orgId: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    imageUrl: v.string(),
    // .index() 用于配置索引  .searchIndex() 用于配置全局搜索索引
  })
    .index('by_org', ['orgId'])
    .searchIndex('search_title', {
      searchField: 'title',
      filterFields: ['orgId'],
    }),
  userFavorites: defineTable({
    orgId: v.string(),
    userId: v.string(),
    boardId: v.id('boards'),
  })
    .index('by_board', ['boardId'])
    .index('by_user_org', ['userId', 'orgId'])
    .index('by_user_board', ['userId', 'boardId'])
    .index('by_user_board_org', ['userId', 'boardId', 'orgId',]),
})
