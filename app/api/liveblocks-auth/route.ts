import { Liveblocks } from '@liveblocks/node'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '@/convex/_generated/api'
import { auth, currentUser } from '@clerk/nextjs'

// 创建一个ConvexHttpClient实例对象，该对象用于通过HTTP方式与指定URL的Convex数据库进行交互操作。
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// 创建一个Liveblocks实例对象，该对象用于访问和操作Liveblocks服务提供的Restful API接口。
// 参数中包含了Liveblocks服务的密钥（secret key），这是进行身份验证和授权所必需的。
const liveblocks = new Liveblocks({
	secret: process.env.LIVEBLOCKS_SECRET_KEY!,
})

export async function POST(request: Request) {
	// 获取身份验证结果
	const authorization = await auth()

	// 获取用户信息
	const user = await currentUser()

	// 身份验证
	if (!authorization || !user) {
		return new Response('Unauthorization', { status: 403 })
	}

	/*
	如果客户端需要访问某个特定的房间（例如实时聊天室）
	那么请求体中会包含一个名为 room 的属性，并赋予该属性一个特定的值，表示访问该房间需要授权。
	在这种情况下，服务器将会生成一个针对该房间的授权令牌，并将其返回给客户端。

	另一方面，如果客户端需要访问的资源不属于任何特定的房间（例如通知或其他公共资源）
	那么请求体中的 room 属性将不会被定义。在这种情况下，服务器将会生成一个通用的授权令牌，并将其返回给客户端，以便访问该资源。 */
	const { room } = await request.json()

	// 获取指定房间中的画板信息
	const board = await convex.query(api.board.get, { id: room })

	// 如果当前访问的画板id和用户所处的组织id不一致，则返回403错误
	if (board?.orgId !== authorization.orgId) {
		return new Response('Unauthorization', { status: 403 })
	}

	/* 
	 自定义用户元数据 该数据对于房间中的所有其他客户端可见
	 可以通过useSelf获取当前用户的信息
	 例如： const { name, picture } = useSelf((me) => me.info); */
	const userInfo = {
		name: user.firstName || 'Teammeate',
		picture: user.imageUrl!,
	}

	// 创建会话 用以授权用户访问 liveblocks 服务
	const session = liveblocks.prepareSession(user.id, {
		userInfo,
	})

	// 创建会话权限 允许访问
	if (room) {
		session.allow(room, session.FULL_ACCESS)
	}

	// 授权会话
	// 访问LiveBlocks服务器  返回一个 签名令牌
	const { status, body } = await session.authorize()
	
	console.log({ status, body, userInfo })

	return new Response(body, { status })
}

/* 客户端（Client）：首先，客户端通过调用@liveblocks/client库中的client.enter("room-id")方法来进入指定的房间（"room-id"）。

POST /auth-endpoint：接着，客户端向服务器发送一个POST请求到/auth-endpoint，以进行身份验证。

服务器（Server）：在服务器端，使用@liveblocks/node库中的liveblocks.prepareSession()和session.authorize()方法来准备会话并授权。

返回token：服务器完成身份验证后，返回一个token给客户端。

更新存在状态：客户端收到token后，更新自己的存在状态。

发送其他用户的更新：服务器开始从其他用户那里接收更新，并将这些更新发送给客户端。 */
