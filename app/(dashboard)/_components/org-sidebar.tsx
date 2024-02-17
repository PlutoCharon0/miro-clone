'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { OrganizationSwitcher } from '@clerk/nextjs'
import { LayoutDashboard, Star } from 'lucide-react'
import { Poppins } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const font = Poppins({
	weight: '600',
	subsets: ['latin'],
})

// 工作侧边栏组件
const OrgSidebar = () => {
	const searchParams = useSearchParams()
	const favorites = searchParams.get('favorites')
	return (
		<div className='hidden lg:flex flex-col space-y-6 w-[206px] pl-5 pt-5'>
			<Link href='/'>
				<div className='flex items-center gap-x-2'>
					<Image alt='Logo' src='/logo.svg'width={60} height={60}  priority />
					<span className={cn('font-semibold text-2xl', font.className)}>
						Clannad
					</span>
				</div>
			</Link>
			{/* 组织管理组件 */}
			<OrganizationSwitcher
				hidePersonal
				appearance={{
					elements: {
						rootBox: {
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							width: '100%',
						},
						organizationSwitcherTrigger: {
							padding: '6px',
							width: '100%',
							borderRadius: '8px',
							border: '1px solid #E5E7EB',
							justifyContent: 'space-between',
							backgroundColor: 'white',
						},
					},
				}}
			/>
			<div className='space-y-1 h-full'>
				<Button
					variant={favorites ? 'ghost' : 'secondary'}
					asChild
					size='lg'
					className='font-normal justify-start px-2 w-full'>
					<Link href='/'>
						<LayoutDashboard className='h-4 w-4 mr-2' />
						Team boards
					</Link>
				</Button>
				<Button
					variant={favorites ? 'secondary' : 'ghost'}
					asChild
					size='lg'
					className='font-normal justify-start px-2 w-full'>
					<Link
						href={{
							pathname: '/',
							query: {
								favorites: true,
							},
						}}>
						<Star className='h-4 w-4 mr-2' />
						Favorite boards
					</Link>
				</Button>
			</div>
		</div>
	)
}

export default OrgSidebar
