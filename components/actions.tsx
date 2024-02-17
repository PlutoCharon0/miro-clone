'use client'

import { DropdownMenuContentProps } from '@radix-ui/react-dropdown-menu'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link2, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useApiMutation } from '@/hooks/use-api-mutation'
import { api } from '@/convex/_generated/api'
import ConfirmModal from './confirm-modal'
import { Button } from '@/components/ui/button'
import { useRenameModal } from '@/store/use-rename-moadl'

interface ActionsProps {
	children: React.ReactNode
	side?: DropdownMenuContentProps['side']
	sideOffset?: DropdownMenuContentProps['sideOffset']
	id: string
	title: string
}

const Actions = ({ children, side, sideOffset, id, title }: ActionsProps) => {
	const onOpen = useRenameModal((state) => state.onOpen)

	const { mutate, pending } = useApiMutation(api.board.remove)

	const onDelete = () => {
		mutate({ id })
			.then(() => toast.success('Board deleted'))
			.catch(() => toast.error('Failed to delete board'))
	}
	// TODO： 优化组件的重复渲染
	// console.log('actions render')

	const onCopyLink = () => {
		// 编辑剪切板内容
		navigator.clipboard
			.writeText(`${window.location.origin}/board/${id}`)
			.then(() => toast.success('Link copied'))
			.catch(() => toast.error('Failed to copy link'))
	}
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
			<DropdownMenuContent
				side={side}
				sideOffset={sideOffset}
				onClick={(e) => e.stopPropagation()}
				className='w-60'>
				<DropdownMenuItem onClick={onCopyLink}>
					<Link2 className='h-4 w-4 mr-2' />
					Copy board link
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => onOpen(id, title)}
					className='p-3 cursor-pointer'>
					<Pencil className='h-4 w-4 mr-2' />
					Rename
				</DropdownMenuItem>
				<ConfirmModal
					header='Delete board?'
					desription='This will delete the board nd all of its contents'
					disabled={pending}
					onConfirm={onDelete}>
					<Button
						variant='ghost'
						className='p-3 cursor-pointer text-sm w-full justify-start font-normal '>
						<Trash2 className='h-4 w-4 mr-2' />
						Delete
					</Button>
				</ConfirmModal>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
export default Actions
