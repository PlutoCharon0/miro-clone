'use client'

import { api } from '@/convex/_generated/api'
import { useApiMutation } from '@/hooks/use-api-mutation'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Plus } from 'lucide-react'

interface NewBoardButtonProps {
	orgId: string
	disabled?: boolean
}

const NewBoardButton = ({ orgId, disabled }: NewBoardButtonProps) => {
	const router = useRouter()
	const { mutate, pending } = useApiMutation(api.board.create)
	const onClick = () => {
		mutate({
			orgId,
			title: `Untitled-${Math.floor(Math.random() * 100)}`,
		})
			.then((id) => {
				toast.success('Board created')
				router.push(`/board/${id}`)
			})
			.catch(() => toast.error('Failed to create board'))
	}
	return (
		<button
			disabled={pending || disabled}
			onClick={onClick}
			className={cn(
				'col-span-1 aspect-[100/127] bg-blue-600 rounded-lg hover:bg-blue-800 flex flex-col items-center justify-center py-6',
				(pending || disabled) &&
					'opacity-75 hover:bg-blue-600 cursor-not-allowed'
			)}>
			<Plus className='h-123 w-12 text-white stroke-1'></Plus>
			<p className='text-sm text-white font-light'>New Board</p>
		</button>
	)
}

export default NewBoardButton
