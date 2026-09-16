import { useMemo, useState } from 'react'
import { Pages } from './Sidebar'
import { GithubRepo } from '@renderer/stores/user/user.types'
import { useHasSession } from '@renderer/hooks/sessions/useHasSession'
import { Header } from './Header'
import { ActiveRepository } from '@renderer/tabs/ActiveRepository/ActiveRepository'
import { useUserStore } from '@renderer/stores/user/user.store'
import { useSessionsStore } from '@renderer/stores/sessions/sessions.store'
import { CreateSessionModal } from './CreateSessionsModal'
import { cn } from '@renderer/lib/utils'
import { RepositoryCard } from '@renderer/tabs/Repositories/RepositoryCard'

export const Layout = () => {
	const page: Pages = 'repositories'
	const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null)
	const [isOpen, setIsOpen] = useState(false)
	const repos = useUserStore((state) => state.repos)
	const sessions = useSessionsStore((state) => state.sessions)
	const sessionIds = useMemo(() => new Set(sessions.keys()), [sessions])

	const onCancel = () => {
		setSelectedRepo(null)
		setIsOpen(false)
	}

	const sessionRepos = useMemo(
		() => repos?.filter((repo) => sessionIds.has(repo.id)) ?? [],
		[repos, sessionIds]
	)
	const availableRepos = useMemo(
		() => repos?.filter((repo) => !sessionIds.has(repo.id)) ?? [],
		[repos, sessionIds]
	)

	const handleSelectRepository = (repo: GithubRepo) => {
		setSelectedRepo({ ...repo, clone_url: repo.clone_url.replace('.git', '') })
		if (sessionIds.has(repo.id)) return
		setIsOpen(true)
	}

	const isSelectedActiveRepo = useHasSession(selectedRepo?.id)

	return (
		<>
			{selectedRepo && (
				<CreateSessionModal isOpen={isOpen} onCancel={onCancel} selectedRepo={selectedRepo} />
			)}
			<div className="flex w-full h-screen">
				<div className={cn('flex flex-col w-full transition-all duration-300 ease-in-out')}>
					<Header />
					<div className="flex-1 min-h-0 overflow-x-hidden">
						{page === 'repositories' &&
							(isSelectedActiveRepo && selectedRepo ? (
								<ActiveRepository repo={selectedRepo} onBack={onCancel} />
							) : (
								<div className="space-y-6 px-6 py-4">
									{sessionRepos.length > 0 && (
										<section>
											<h2 className="mb-3 text-sm font-semibold text-zinc-900">Sessions</h2>
											<div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
												{sessionRepos.map((repo) => (
													<RepositoryCard
														key={repo.id}
														repo={repo}
														onClick={handleSelectRepository}
													/>
												))}
											</div>
										</section>
									)}

									<section>
										{sessionRepos.length > 0 && (
											<h2 className="mb-3 text-sm font-semibold text-zinc-900">Repositories</h2>
										)}
										<div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
											{availableRepos.map((repo) => (
												<RepositoryCard
													key={repo.id}
													repo={repo}
													onClick={handleSelectRepository}
												/>
											))}
										</div>
									</section>
								</div>
							))}
					</div>
				</div>
			</div>
		</>
	)
}
