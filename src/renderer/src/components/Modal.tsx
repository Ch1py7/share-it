/** biome-ignore-all lint/a11y/useKeyWithClickEvents: The backdrop intentionally only responds to pointer interactions. */
import { cn } from '@renderer/lib/utils'
import { useEffect, useRef } from 'react'

interface ModalProps {
	open: boolean
	onClose: () => void
	children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
	const dialogRef = useRef<HTMLDialogElement>(null)

	useEffect(() => {
		const dialog = dialogRef.current
		if (!dialog) return

		if (open) {
			dialog.showModal()
		} else {
			dialog.close()
		}
	}, [open])

	const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
		if (e.target === dialogRef.current) {
			onClose()
		}
	}

	return (
		<dialog
			ref={dialogRef}
			onClose={onClose}
			onClick={handleBackdropClick}
			className={cn(
				'w-150 rounded-2xl bg-white p-6 shadow-2xl border-none outline-none',
				'backdrop:bg-black/40 backdrop:backdrop-blur-xs',
				'transition-all duration-200 allow-discrete m-auto',
				'open:translate-y-0 open:scale-100 open:opacity-100',
				'starting:open:translate-y-4 starting:open:scale-95 starting:open:opacity-0'
			)}
		>
			{children}
		</dialog>
	)
}
