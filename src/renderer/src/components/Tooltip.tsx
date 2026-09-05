import { cn } from '@renderer/lib/utils'

interface TooltipProps {
	content: React.ReactNode
	children: React.ReactNode
	position?: 'top' | 'bottom' | 'left' | 'right'
	className?: string
	tooltipClassNames?: string
	align?: 'left' | 'center' | 'right' | 'top' | 'bottom'
	disabled?: boolean
}

const positionClasses = {
	top: 'bottom-full mb-2',
	bottom: 'top-full mt-2',
	left: 'right-full mr-2',
	right: 'left-full ml-2',
}

const alignClasses = {
	top: {
		left: 'left-0',
		center: 'left-1/2 -translate-x-1/2',
		right: 'right-0',
	},
	bottom: {
		left: 'left-0',
		center: 'left-1/2 -translate-x-1/2',
		right: 'right-0',
	},
	left: {
		top: 'top-0',
		center: 'top-1/2 -translate-y-1/2',
		bottom: 'bottom-0',
	},
	right: {
		top: 'top-0',
		center: 'top-1/2 -translate-y-1/2',
		bottom: 'bottom-0',
	},
}

export const Tooltip: React.FC<TooltipProps> = ({
	content,
	children,
	className,
	tooltipClassNames,
	position = 'top',
	align = 'left',
	disabled,
}) => {
	return (
		<div className={cn('relative inline-block group z-10', className)}>
			{children}
			<div
				role="tooltip"
				className={cn(
					disabled && 'hidden',
					'absolute opacity-0 group-hover:opacity-100',
					'pointer-events-none transition-all duration-200',
					'group-hover:pointer-events-auto',
					tooltipClassNames,
					positionClasses[position],
					alignClasses[position][align]
				)}
			>
				{content}
			</div>
		</div>
	)
}
