import { cn } from '@renderer/lib/utils'
import { Card } from './Card'

interface RoleCardProps {
	title: string
	description: string
	icon: React.ReactNode
	iconStyle?: string
}

export const RoleCard: React.FC<RoleCardProps> = ({ icon, title, description, iconStyle }) => {
	return (
		<Card className="flex flex-col items-center justify-center group cursor-pointer p-7 transition-all hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl">
			<div
				className={cn(
					'flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700',
					iconStyle
				)}
			>
				{icon}
			</div>

			<h2 className="mt-6 text-xl font-semibold">{title}</h2>

			<p className="mt-3 text-sm leading-6 text-zinc-500">{description}</p>
		</Card>
	)
}
