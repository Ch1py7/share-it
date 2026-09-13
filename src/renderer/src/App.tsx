import { useMemo, useState } from 'react'
import './App.css'
import { Header } from './components/Header'
import { Loading } from './components/Loading'
import { Login } from './components/Login'
import { GithubRepo } from './stores/user/user.types'
import { CreateSessionModal } from './components/CreateSessionsModal'
import { ActiveRepository } from './tabs/ActiveRepository/ActiveRepository'
import { Repositories } from './tabs/Dashboard/Dashboard'
import { useSessionsStore } from './stores/sessions/sessions.store'
import { useUserStore } from './stores/user/user.store'
import { Initializer } from './components/Initializer'
import { SocketHandler } from './components/SocketHandler'
import { useHasSession } from './hooks/sessions/useHasSession'
import { useShallow } from 'zustand/shallow'
import { Toaster } from 'sonner'

export const App = () => {
	const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null)
	const [isOpen, setIsOpen] = useState(false)

	const sessions = useSessionsStore((state) => state.sessions)
	const { user, loading, repos } = useUserStore(
		useShallow((state) => ({
			user: state.user,
			loading: state.loading,
			repos: state.repos,
		}))
	)

	const sessionIds = useMemo(() => new Set(sessions.keys()), [sessions])

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
		setSelectedRepo(repo)
		if (sessionIds.has(repo.id)) return
		setIsOpen(true)
	}

	const onCancel = () => {
		setSelectedRepo(null)
		setIsOpen(false)
	}

	const isSelectedActiveRepo = useHasSession(selectedRepo?.id)

	return (
		<>
			<Toaster position="top-right" richColors closeButton />
			<SocketHandler />
			<Initializer />
			{loading ? (
				<Loading />
			) : user ? (
				<div className="h-screen w-screen flex flex-col">
					{selectedRepo && (
						<CreateSessionModal isOpen={isOpen} onCancel={onCancel} selectedRepo={selectedRepo} />
					)}
					<Header />
					<div className="flex-1 min-h-0 overflow-x-hidden">
						{isSelectedActiveRepo && selectedRepo ? (
							<ActiveRepository repo={selectedRepo} onBack={onCancel} />
						) : (
							<Repositories repos={sortedRepos} onClick={handleSelectRepository} />
						)}
					</div>
				</div>
			) : (
				<Login />
			)}
		</>
	)
}
