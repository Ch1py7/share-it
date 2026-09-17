import { GithubRepo } from '@renderer/stores/user/user.types'
import { useErrors } from '@renderer/hooks/useErrors'
import { ArrowLeft, Ban, Link, Rocket, Trash2 } from 'lucide-react'
import { States } from '@renderer/stores/sessions/sessions.types'
import { Tooltip } from '@renderer/components/Tooltip'
import { SessionStateHelper } from '@renderer/components/tooltips/SessionStateHelper'
import { cn } from '@renderer/lib/utils'
import { sessionStateConfig } from '@renderer/constants/states'
import { useSessionsStore } from '@renderer/stores/sessions/sessions.store'
import { useUserStore } from '@renderer/stores/user/user.store'
import { Errors } from './Errors'
import { UnlinkedRepository } from './UnlinkedRepository'
import { LinkedRepository } from './LinkedRepository'
import { useCurrentSession } from '@renderer/hooks/sessions/useCurrentSession'
import { TransferHistory } from './TransferHistory'
import { SharingPermissions } from './SharingPermissions'
import { useState } from 'react'
import { ReceiveDestinationNotice } from './ReceiveDestinationNotice'

interface ActiveRepositoryProps {
	repo: GithubRepo
	onBack: () => void
}

export const ActiveRepository: React.FC<ActiveRepositoryProps> = ({ repo, onBack }) => {
	const [hoveredFileIds, setHoveredFileIds] = useState<Set<string>>(new Set())
	const [activeTab, setActiveTab] = useState<'files' | 'permissions'>('files')
	const removeSession = useSessionsStore((state) => state.removeSession)
	const user = useUserStore((state) => state.user)
	const {
		error,
		customMessage,
		onClose,
		setDifferentRepository,
		setInvalidRepository,
		setCustomMessage,
	} = useErrors()

	const currentSession = useCurrentSession(repo.id)
	const sessionState: States = currentSession?.state ?? 'disconnected'
	const showPermissionsTab = Boolean(currentSession?.repository && currentSession.role === 'owner')
	const showingPermissions = showPermissionsTab && activeTab === 'permissions'

	const onDeleteSession = async () => {
		if (currentSession?.state === 'connected') {
			await handleDisonnectSession()
		}

		removeSession(repo.id)
	}

	const handleConnectSession = async () => {
		if (!user) return
		await window.electron.socket.connectSession({
			repoId: repo.id.toString(),
			repositoryName: repo.name,
			role: currentSession?.role ?? 'collaborator',
		})
	}

	const handleDisonnectSession = async () => {
		if (!user) return
		await window.electron.socket.disconnectSession({
			repoId: repo.id.toString(),
			repositoryName: repo.name,
		})
	}

	return (
		<div className="flex h-full flex-col p-6 gap-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<button
						type="button"
						onClick={onBack}
						className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white transition hover:bg-zinc-100"
					>
						<ArrowLeft size={18} />
					</button>
					<Tooltip
						position="bottom"
						content={<SessionStateHelper currentSession={currentSession} error={error} />}
						tooltipClassNames="w-2/1"
					>
						<div className="flex items-center gap-2">
							<div className={cn('w-2 h-2 rounded-full', sessionStateConfig[sessionState].color)} />
							<div>
								<h1 className="text-2xl font-bold tracking-tight">{repo.name}</h1>

								<p className="text-sm text-zinc-500">{repo.full_name}</p>
							</div>
						</div>
					</Tooltip>
					{currentSession?.repository && (
						<ReceiveDestinationNotice
							repositoryPath={currentSession.repository.path}
							userId={user?.id}
						/>
					)}
				</div>

				<div className="flex gap-2 items-center">
					{(sessionState === 'pending' || sessionState === 'error') && (
						<button
							type="button"
							className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-1 text-sm font-medium text-white shadow-sm transition-all hover:bg-violet-700 hover:shadow-md"
							onClick={handleConnectSession}
						>
							{currentSession?.role === 'owner' ? <Rocket size={16} /> : <Link size={16} />}
							{currentSession?.role === 'owner' ? 'Create Session' : 'Join Session'}
						</button>
					)}
					{sessionState === 'connected' && (
						<button
							type="button"
							className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-1 text-sm font-medium text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md"
							onClick={handleDisonnectSession}
						>
							<Ban size={16} />
							Disconnect
						</button>
					)}
					<Tooltip
						position="bottom"
						content={<SessionStateHelper currentSession={currentSession} error={error} />}
						align="right"
						tooltipClassNames="w-2/1"
					>
						<div
							className={cn(
								'flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium',
								sessionStateConfig[sessionState].bg,
								sessionStateConfig[sessionState].text
							)}
						>
							<div className={cn('h-2 w-2 rounded-full', sessionStateConfig[sessionState].color)} />
							{sessionStateConfig[sessionState].label}
						</div>
					</Tooltip>
					<button
						type="button"
						onClick={onDeleteSession}
						className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-all hover:bg-red-50 hover:text-red-600"
						title="Delete session"
					>
						<Trash2 size={17} />
					</button>
				</div>
			</div>
			<Errors customMessage={customMessage} error={error} onClose={onClose} repo={repo} />
			{showPermissionsTab && (
				<div className="flex gap-1 border-b border-zinc-200">
					{(['files', 'permissions'] as const).map((tab) => (
						<button
							key={tab}
							type="button"
							onClick={() => setActiveTab(tab)}
							className={cn(
								'border-b-2 px-4 py-2 text-sm font-medium transition-colors',
								activeTab === tab
									? 'border-violet-600 text-violet-700'
									: 'border-transparent text-zinc-500 hover:text-zinc-900'
							)}
						>
							{tab === 'files' ? 'Files' : 'Sharing permissions'}
						</button>
					))}
				</div>
			)}
			<div className="flex flex-1 overflow-hidden gap-4">
				{currentSession?.repository ? (
					showingPermissions ? (
						<SharingPermissions repoId={repo.id} />
					) : (
						<LinkedRepository repo={repo} hoveredFileIds={hoveredFileIds} />
					)
				) : (
					<UnlinkedRepository
						onClose={onClose}
						repo={repo}
						setCustomMessage={setCustomMessage}
						setDifferentRepository={setDifferentRepository}
						setInvalidRepository={setInvalidRepository}
					/>
				)}
				{!showingPermissions && (
					<TransferHistory repoId={repo.id} setHoveredFileIds={setHoveredFileIds} />
				)}
			</div>
		</div>
	)
}
