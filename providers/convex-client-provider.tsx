'use client'

import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { ConvexReactClient, AuthLoading, Authenticated } from 'convex/react'
import Loading from '@/components/auth/loading'

interface ConvexClientProviderProps {
	children: React.ReactNode
}
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

const convex = new ConvexReactClient(convexUrl as string)

export const ConvexClientProvider = ({
	children,
}: ConvexClientProviderProps) => {
	return (
		<ClerkProvider>
			<ConvexProviderWithClerk useAuth={useAuth} client={convex}>
				<Authenticated>{children}</Authenticated>
				{/* 配置加载过程中的过渡效果 */}
				<AuthLoading>
					<Loading></Loading>
				</AuthLoading>
			</ConvexProviderWithClerk>
		</ClerkProvider>
	)
}
