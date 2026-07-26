import { cn } from '@renderer/lib/utils'
import { useEffect, useState } from 'react'

interface ModalProps {
	open: boolean
	onClose: () => void
	children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
	const [mounted, setMounted] = useState(open)

	useEffect(() => {
		if (open) {
			setMounted(true)
			return
		}

		const timeout = setTimeout(() => {
			setMounted(false)
		}, 200)

		return () => clearTimeout(timeout)
	}, [open])

	if (!mounted) return null

	return (
		<div
			className={cn(
				'fixed inset-0 z-50 flex items-center justify-center',
				'bg-black/40 backdrop-blur-xs',
				'transition-opacity duration-200',
				open ? 'opacity-100' : 'opacity-0'
			)}
			onClick={onClose}
		>
			<div
				onClick={(e) => e.stopPropagation()}
				className={cn(
					'w-150 rounded-2xl bg-white p-6 shadow-2xl',
					'transition-all duration-200',
					open ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'
				)}
			>
				{children}
			</div>
		</div>
	)
}
