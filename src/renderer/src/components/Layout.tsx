import { useMemo, useState } from 'react'
import { Pages, Sidebar } from './Sidebar'
import { GithubRepo } from '@renderer/stores/user/user.types'
import { useHasSession } from '@renderer/hooks/sessions/useHasSession'
import { Header } from './Header'
import { ActiveRepository } from '@renderer/tabs/ActiveRepository/ActiveRepository'
import { Repositories } from '@renderer/tabs/Dashboard/Dashboard'
import { useUserStore } from '@renderer/stores/user/user.store'
import { useSessionsStore } from '@renderer/stores/sessions/sessions.store'
import { CreateSessionModal } from './CreateSessionsModal'
import { cn } from '@renderer/lib/utils'

export const Layout = () => {
	const [page, setPage] = useState<Pages>('repositories')
	const [isExtended, setIsExtended] = useState<boolean>(true)
	const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null)
	const [isOpen, setIsOpen] = useState(false)
	const repos = useUserStore((state) => state.repos)
	const sessions = useSessionsStore((state) => state.sessions)
	const sessionIds = useMemo(() => new Set(sessions.keys()), [sessions])

	const onCancel = () => {
		setSelectedRepo(null)
		setIsOpen(false)
	}

	const sortedRepos = useMemo(
		() =>
			repos?.toSorted((a, b) => {
				const aActive = sessionIds.has(a.id)
				const bActive = sessionIds.has(b.id)

				return Number(bActive) - Number(aActive)
			}) ?? [],
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
				<Sidebar
					page={page}
					setPage={setPage}
					isExtended={isExtended}
					setIsExtended={setIsExtended}
				/>
				<div
					className={cn(
						'flex flex-col w-full transition-all duration-300 ease-in-out',
						isExtended ? 'ms-42' : ' ms-15'
					)}
				>
					<Header />
					<div className="flex-1 min-h-0 overflow-x-hidden">
						{page === 'repositories' &&
							(isSelectedActiveRepo && selectedRepo ? (
								<ActiveRepository repo={selectedRepo} onBack={onCancel} />
							) : (
								<Repositories repos={sortedRepos} onClick={handleSelectRepository} />
							))}
					</div>
				</div>
			</div>
		</>
	)
}
