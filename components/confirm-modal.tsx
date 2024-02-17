'use client'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogCancel,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
} from '@/components/ui/alert-dialog'
import {
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@radix-ui/react-alert-dialog'

interface ConfirmModalProps {
	children: React.ReactNode
	onConfirm: () => void
	disabled?: boolean
	header: string
	desription?: string
}

const ConfirmModal = ({
	children,
	onConfirm,
	desription,
	header,
	disabled,
}: ConfirmModalProps) => {
	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{header}</AlertDialogTitle>
					<AlertDialogDescription>{desription}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction disabled={disabled} onClick={onConfirm}>
						Confirm
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}

export default ConfirmModal
