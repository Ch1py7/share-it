import { cn } from '@renderer/lib/utils'

interface CardProps {
	children: React.ReactNode
	className?: string
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
	return (
		<div
			className={cn(
				'w-fit rounded-2xl border border-zinc-200/80 bg-white/80 shadow-xl backdrop-blur-xl transition-all duration-200',
				className
			)}
		>
			{children}
		</div>
	)
}
