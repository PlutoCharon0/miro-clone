'use client'

import Hint from '@/components/hint'
import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ToolButtonProps {
	label: string
	icon: LucideIcon
	onClick: () => void
	isActive?: boolean
	isDisadbled?: boolean
}

const ToolButton = ({
	label,
	icon: Icon,
	onClick,
	isActive,
	isDisadbled,
}: ToolButtonProps) => {
	return (
		<Hint label={label} side='right' sideOffset={14}>
			<Button
				disabled={isDisadbled}
				onClick={onClick}
				size='icon'
				variant={isActive ? 'boardActive' : 'board'}>
				<Icon></Icon>
			</Button>
		</Hint>
	)
}

export default ToolButton
