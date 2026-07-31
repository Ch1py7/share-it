import { cn } from '@renderer/lib/utils'

interface TooltipProps {
	content: React.ReactNode
	children: React.ReactNode
	position?: 'top' | 'bottom' | 'left' | 'right'
	className?: string
}

export const Tooltip: React.FC<TooltipProps> = ({
	content,
	children,
	className,
	position = 'top',
}) => {
	const positionClasses = {
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
		left: 'right-full top-1/2 -translate-y-1/2 mr-2',
		right: 'left-full top-1/2 -translate-y-1/2 ml-2',
	}

	return (
		<div className={cn('relative inline-block group z-10', className)}>
			{children}
			<div
				role="tooltip"
				className={cn(
					'absolute mt-2 opacity-0 group-hover:opacity-100',
					'pointer-events-none transition-all duration-200',
					'group-hover:pointer-events-auto w-full',
					positionClasses[position]
				)}
			>
				{content}
			</div>
		</div>
	)
}
