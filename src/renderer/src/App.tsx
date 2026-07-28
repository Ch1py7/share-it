import { useState } from 'react'
import './App.css'
import { Header } from './components/Header'
import { Loading } from './components/Loading'
import { useUser } from './context/user.context'
import { Login } from './components/Login'
import { GithubRepo } from './context/user.types'
import { CreateSessionModal } from './components/CreateSessionsModal'
import { useSessions } from './context/sessions/sessions.context'
import { ActiveRepository } from './tabs/ActiveRepository/ActiveRepository'
import { Repositories } from './tabs/Dashboard/Dashboard'

export const App = () => {
	const { sessions, hasSession } = useSessions()
	const { user, loading, repos } = useUser()
	const [isOpen, setIsOpen] = useState(false)
	const [selectedRepo, setSelectedRepo] = useState<GithubRepo | null>(null)

	if (loading) {
		return <Loading />
	}

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

	if (user) {
		return (
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
		)
	}

	return <Login />
}
