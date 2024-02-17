import { Liveblocks } from '@liveblocks/node'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { auth, currentUser } from '@clerk/nextjs'

// 创建convex实例对象 借此通过HTTP的方式操作数据库
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// 创建liveblocks实例对象 借此提供对 Restful Api 的访问能力
const liveblocks = new Liveblocks({
	secret: process.env.LIVEBLOCKS_SECRET_KEY!,
})

export async function POST(request: Request) {
	// 获取身份验证结果
	const authorization = await auth()
	// 获取用户信息
	const user = await currentUser()

	if (!authorization || !user) {
		return new Response('Unauthorization', { status: 403 })
	}

	const { room } = await request.json()

	const board = await convex.query(api.board.get, { id: room })

	console.log('AUTH_INFO', {
		room,
		board,
		boardOrgId: board?.orgId,
		userOrgId: authorization.orgId,
	})

	if (board?.orgId !== authorization.orgId) {
		return new Response('Unauthorization', { status: 403 })
	}

	const userInfo = {
		name: user.firstName || 'Teammeate',
		picture: user.imageUrl!,
	}
	console.log({ userInfo })

	// 创建会话
	const session = liveblocks.prepareSession(user.id, {
		userInfo,
	})

	// 创建会话权限
	if (room) {
		session.allow(room, session.FULL_ACCESS)
	}

	// 授权会话
	// 访问LiveBlocks服务器  返回一个 签名令牌
	const { status, body } = await session.authorize()

	console.log({ status, body }, 'ALLOWED')

	return new Response(body, { status })
}
