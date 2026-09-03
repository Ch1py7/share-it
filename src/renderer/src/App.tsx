import { useState } from 'react'
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

export const App = () => {
	const { sessions, hasSession } = useSessionsStore()
	const { user, loading, repos } = useUserStore()
	const [isOpen, setIsOpen] = useState(false)
	const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null)

	const sessionIds = new Set(sessions.keys())
	const sortedRepos =
		repos?.toSorted((a, b) => {
			const aActive = sessionIds.has(a.id)
			const bActive = sessionIds.has(b.id)

			return Number(bActive) - Number(aActive)
		}) ?? []

	const handleSelectRepository = (repo: GithubRepo) => {
		setSelectedRepo(repo)
		if (hasSession(repo.id)) return
		setIsOpen(true)
	}

	const onCancel = () => {
		setSelectedRepo(null)
		setIsOpen(false)
	}

	const isSelectedActiveRepo = selectedRepo && hasSession(selectedRepo.id)

	return (
		<>
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
						{isSelectedActiveRepo ? (
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
