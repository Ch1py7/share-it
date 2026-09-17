import { useEffect, useMemo, useRef, useState } from 'react'
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
import { LoaderCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Settings } from '@renderer/tabs/Settings/Settings'

export const Layout = () => {
	const [page, setPage] = useState<Pages>('repositories')
	const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null)
	const [isOpen, setIsOpen] = useState(false)
	const repos = useUserStore((state) => state.repos)
	const user = useUserStore((state) => state.user)
	const fetchRepos = useUserStore((state) => state.fetchRepos)
	const reposLoading = useUserStore((state) => state.reposLoading)
	const hasMoreRepos = useUserStore((state) => state.hasMoreRepos)
	const sessions = useSessionsStore((state) => state.sessions)
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	const loadMoreRef = useRef<HTMLDivElement>(null)
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

	useEffect(() => {
		if (user && repos.length === 0) fetchRepos(true)
	}, [fetchRepos, repos.length, user])

	useEffect(() => {
		const target = loadMoreRef.current
		const root = scrollContainerRef.current
		if (!target || !root || !hasMoreRepos || reposLoading) return

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) fetchRepos()
			},
			{ root, rootMargin: '300px' }
		)

		observer.observe(target)
		return () => observer.disconnect()
	}, [fetchRepos, hasMoreRepos, reposLoading])

	const handleRefresh = async () => {
		if (reposLoading) return
		if (await fetchRepos(true)) toast.success('Repositories refreshed')
	}

	return (
		<>
			{selectedRepo && (
				<CreateSessionModal isOpen={isOpen} onCancel={onCancel} selectedRepo={selectedRepo} />
			)}
			<div className="flex w-full h-screen">
				<div className={cn('flex flex-col w-full transition-all duration-300 ease-in-out')}>
					<Header onOpenSettings={() => setPage('settings')} isSettingsOpen={page === 'settings'} />
					<div
						ref={scrollContainerRef}
						className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto"
					>
						{page === 'settings' ? (
							<Settings onBack={() => setPage('repositories')} />
						) : isSelectedActiveRepo && selectedRepo ? (
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
									<div className="mb-3 flex min-h-8 items-center justify-between">
										{sessionRepos.length > 0 && (
											<h2 className="text-sm font-semibold text-zinc-900">Repositories</h2>
										)}
										<button
											type="button"
											onClick={handleRefresh}
											disabled={reposLoading}
											className="ml-auto flex h-8 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
										>
											<RefreshCw size={14} className={cn(reposLoading && 'animate-spin')} />
											{reposLoading ? 'Loading...' : 'Refresh'}
										</button>
									</div>
									<div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
										{availableRepos.map((repo) => (
											<RepositoryCard key={repo.id} repo={repo} onClick={handleSelectRepository} />
										))}
									</div>
									<div ref={loadMoreRef} className="flex h-12 items-center justify-center">
										{reposLoading && (
											<LoaderCircle className="animate-spin text-zinc-400" size={20} />
										)}
									</div>
								</section>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	)
}
