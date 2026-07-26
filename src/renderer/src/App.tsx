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
import { cn } from './lib/utils'
import { Dashboard } from './tabs/Dashboard/Dashboard'

export const App = () => {
	const { sessions } = useSessions()
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
		if (sessions.has(repo.id)) return
		setIsOpen(true)
	}

	const onCancel = () => {
		setSelectedRepo(null)
		setIsOpen(false)
	}

	const isSelectedActiveRepo = selectedRepo && sessions.has(selectedRepo.id)

	if (user) {
		return (
			<>
				{selectedRepo && (
					<CreateSessionModal isOpen={isOpen} onCancel={onCancel} selectedRepo={selectedRepo} />
				)}
				<Header />
				<div
					className={cn(
						'grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 px-6 py-4',
						isSelectedActiveRepo && 'block'
					)}
				>
					{isSelectedActiveRepo ? (
						<ActiveRepository repo={selectedRepo} onBack={onCancel} />
					) : (
						<Dashboard repos={sortedRepos} onClick={handleSelectRepository} />
					)}
				</div>
			</>
		)
	}

	return <Login />
}
