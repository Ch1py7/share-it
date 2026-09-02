import { ExternalLink, GitFork, Lock, Star } from 'lucide-react'
import { Card } from '../../components/Card'
import { GithubRepo } from '@renderer/stores/user/user.types'
import { cn } from '@renderer/lib/utils'
import { useSessionsStore } from '@renderer/stores/sessions/sessions.store'
import { getColorByState, getStyleByState } from './utils'
import { useMemo } from 'react'
import { Tooltip } from '@renderer/components/Tooltip'
import { SessionStateHelper } from '@renderer/components/SessionStateHelper'

interface RepositoryCardProps {
	repo: GithubRepo
	onClick: (repo: GithubRepo) => void
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({ repo, onClick }) => {
	const { getCurrentSession } = useSessionsStore()
	const currentSession = getCurrentSession(repo.id)
	const sessionStyle = useMemo(
		() => getStyleByState[currentSession?.state ?? ''],
		[currentSession?.state]
	)

	return (
		<button type="button" onClick={() => onClick(repo)} className={cn('cursor-pointer relative')}>
			<Card
				className={cn(
					'group relative w-full border p-4 transition-all',
					currentSession
						? 'border-zinc-300 shadow-sm'
						: 'border-zinc-200 hover:border-zinc-300 hover:shadow-lg',
					getColorByState(currentSession?.state),
					currentSession &&
						(currentSession?.role === 'owner'
							? 'border-l-4 border-l-violet-500'
							: 'border-l-4 border-l-sky-500')
				)}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<img
							src={repo.owner.avatar_url}
							alt={repo.owner.login}
							className="min-h-10 h-10 min-w-10 w-10 rounded-full aspect-square"
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
				</div>

				<div className="absolute right-3 top-3">
					{!currentSession && (
						<ExternalLink
							size={18}
							className="text-zinc-400 transition-all group-hover:translate-x-1 group-hover:text-zinc-900"
						/>
					)}
				</div>
			</Card>
			{currentSession && (
				<div className="absolute right-3 top-3">
					<Tooltip
						position="bottom"
						content={<SessionStateHelper currentSession={currentSession} />}
					>
						<div
							className={`flex h-8 items-center gap-2 rounded-lg border px-2 ${sessionStyle.className}`}
						>
							{sessionStyle.icon}
							<span className="text-xs font-medium">{sessionStyle.label}</span>
						</div>
					</Tooltip>
				</div>
			)}
		</button>
	)
}
