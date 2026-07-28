import {
	AlertCircle,
	ExternalLink,
	GitFork,
	Loader2,
	Lock,
	Star,
	Wifi,
	WifiOff,
} from 'lucide-react'
import { Card } from '../../components/Card'
import { GithubRepo } from '@renderer/context/user.types'
import { useSessions } from '@renderer/context/sessions/sessions.context'
import { cn } from '@renderer/lib/utils'

interface RepositoryCardProps {
	repo: GithubRepo
	onClick: (repo: GithubRepo) => void
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({ repo, onClick }) => {
	const { hasSession, getCurrentSession } = useSessions()

	const session = getCurrentSession(repo.id)
	const hasSessions = hasSession(repo.id)

	const sessionStyle = {
		connected: {
			icon: <Wifi size={14} />,
			className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
			label: 'Connected',
		},
		loading: {
			icon: <Loader2 size={14} className="animate-spin" />,
			className: 'border-sky-200 bg-sky-50 text-sky-700',
			label: 'Connecting',
		},
		error: {
			icon: <AlertCircle size={14} />,
			className: 'border-red-200 bg-red-50 text-red-700',
			label: 'Error',
		},
		disconnected: {
			icon: <WifiOff size={14} />,
			className: 'border-zinc-200 bg-zinc-50 text-zinc-600',
			label: 'Disconnected',
		},
	}[session?.state ?? '']

	return (
		<button type="button" onClick={() => onClick(repo)} className="cursor-pointer">
			<Card
				className={cn(
					'group relative w-full p-4 transition-all',
					session ? 'border-zinc-300 bg-zinc-50/60' : 'hover:border-zinc-300 hover:shadow-lg',
					session?.state === 'connected' && 'border-l-4 border-l-emerald-500'
				)}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<img
							src={repo.owner.avatar_url}
							alt={repo.owner.login}
							className="min-h-10 h-10 min-w-10 w-10 rounded-full ring-2 ring-white aspect-square"
						/>

						<div>
							<div className="flex gap-1 items-center">
								{repo.private && <Lock size={12} className="text-gray-600" />}
								<h3 className="font-semibold text-zinc-900">{repo.name}</h3>
							</div>

							<div className="mt-1 flex items-center gap-4 text-xs text-zinc-500">
								<span>{repo.owner.login}</span>

								<span className="flex items-center gap-1">
									<Star size={12} />
									{repo.stargazers_count}
								</span>

								<span className="flex items-center gap-1">
									<GitFork size={12} />
									{repo.forks_count}
								</span>
							</div>
						</div>
					</div>

					{!hasSessions && (
						<ExternalLink
							size={18}
							className="absolute top-3 right-3 text-zinc-400 transition-all group-hover:translate-x-1 group-hover:text-zinc-900"
						/>
					)}
				</div>

				<div className="absolute right-3 top-3">
					{session ? (
						<div
							className={`flex h-8 items-center gap-2 rounded-lg border px-2 ${sessionStyle.className}`}
						>
							{sessionStyle.icon}
							<span className="text-xs font-medium">{sessionStyle.label}</span>
						</div>
					) : (
						<ExternalLink
							size={18}
							className="text-zinc-400 transition-all group-hover:translate-x-1 group-hover:text-zinc-900"
						/>
					)}
				</div>
			</Card>
		</button>
	)
}
