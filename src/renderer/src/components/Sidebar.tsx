import { ClockFading, FolderTree, Settings, UsersRound, type LucideIcon } from 'lucide-react'
import { cn } from '@renderer/lib/utils'

const tabs: ITab[] = [
	{ id: 'repositories', label: 'Repositories', icon: FolderTree },
	{ id: 'activity', label: 'Activity', icon: ClockFading },
	{ id: 'sessions', label: 'Sessions', icon: UsersRound },
	{ id: 'settings', label: 'Settings', icon: Settings },
]

const Item: React.FC<ItemProps> = ({ id, label, Icon, page, onClick, onlyIcon }) => {
	const isActive = page === id
	return (
		<button
			type="button"
			onClick={() => onClick(id)}
			className={cn(
				'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition min-h-9 text-nowrap whitespace-nowrap',
				isActive ? 'bg-primary/10 text-primary' : 'text-gray-700'
			)}
		>
			<Icon
				size={18}
				className={cn('transition shrink-0', isActive ? 'text-primary' : 'text-gray-500')}
			/>
			{!onlyIcon && <span className={cn(isActive && 'font-medium')}>{label}</span>}
		</button>
	)
}

export const Sidebar: React.FC<SidebarProps> = ({ page, setPage, isExtended, setIsExtended }) => {
	const onClick = (page: Pages) => {
		setPage(page)
	}

	return (
		<div
			className={cn(
				'fixed left-0 z-10 flex transition-all duration-300 ease-in-out overflow-hidden',
				isExtended ? 'w-42' : ' w-15'
			)}
		>
			<div
				className={cn('flex h-screen px-2 flex-col border-r border-gray-200 bg-white py-6 w-full')}
			>
				<button
					onClick={() => setIsExtended((p) => !p)}
					type="button"
					className="mb-6 w-full flex items-center gap-2 rounded-lg text-sm font-medium"
				>
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white font-bold shrink-0">
						S
					</div>
					{isExtended && <h1 className="text-sm font-semibold text-gray-900 shrink-0">Share-it</h1>}
				</button>
				<div className="flex flex-col gap-1">
					{tabs.map((tab) => (
						<Item
							key={tab.id}
							id={tab.id}
							label={tab.label}
							Icon={tab.icon}
							page={page}
							onClick={onClick}
							onlyIcon={!isExtended}
						/>
					))}
				</div>
			</div>
		</div>
	)
}

interface ITab {
	id: Pages
	label: string
	icon: LucideIcon
}

interface ItemProps {
	id: Pages
	label: string
	Icon: LucideIcon
	page: string
	onClick: (page: Pages) => void
	onlyIcon?: boolean
}

interface SidebarProps {
	page: Pages
	setPage: React.Dispatch<React.SetStateAction<Pages>>
	isExtended: boolean
	setIsExtended: React.Dispatch<React.SetStateAction<boolean>>
}

export type Pages = 'repositories' | 'activity' | 'sessions' | 'settings'
