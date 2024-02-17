import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'

export interface HintProps {
	label: string
	children: React.ReactNode
	side?: 'top' | 'bottom' | 'left' | 'right'
	align?: 'start' | 'center' | 'end'
	sideOffset?: number
	alignOffset?: number
}

// 悬停提示组件
const Hint = ({
	label,
	children,
	side,
	sideOffset,
	align,
	alignOffset,
}: HintProps) => {
	return (
		<TooltipProvider delayDuration={100}>
			<Tooltip>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent
					className='text-white bg-black border-black'
					side={side}
					align={align}
					sideOffset={sideOffset}
					alignOffset={alignOffset}>
					<p className='font-semibold capitalize'>{label}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}

export default Hint
