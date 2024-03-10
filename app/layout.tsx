import './globals.css'

import { Suspense } from 'react'
import type { Metadata } from 'next'

import { ConvexClientProvider } from '@/providers/convex-client-provider'
import { Toaster } from '@/components/ui/sonner'
import ModalProvider from '@/providers/modal-provider'
import Loading from '@/components/auth/loading'

export const metadata: Metadata = {
	title: 'Clannad-DrawLive',
	description: 'Loading Clannad-DrawLive',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en'>
			<link rel='icon' href='./icon.svg' />
			<body className={'font-Inter '}>
				<Suspense fallback={<Loading />}>
					<ConvexClientProvider>
						<Toaster />
						<ModalProvider />
						{children}
					</ConvexClientProvider>
				</Suspense>
			</body>
		</html>
	)
}
