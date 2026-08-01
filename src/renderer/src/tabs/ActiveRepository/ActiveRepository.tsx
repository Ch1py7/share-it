import { Card } from '@renderer/components/Card'
import { ErrorFallback } from '@renderer/components/ErrorFallback'
import { Errors } from '@renderer/constants/errors'
import { useSessions } from '@renderer/context/sessions/sessions.context'
import { GithubRepo } from '@renderer/context/user.types'
import { useErrors } from '@renderer/hooks/useErrors'
import { ArrowLeft, FolderCode, FolderOpen, Trash2 } from 'lucide-react'
import { AddFiles } from './AddFiles'
import { Files } from './Files'
import { Files as FilesType, States } from '@renderer/context/sessions/sessions.types'
import { useState } from 'react'
import { Tooltip } from '@renderer/components/Tooltip'
import { SessionStateHelper } from '@renderer/components/SessionStateHelper'
import { cn } from '@renderer/lib/utils'
import { sessionStateConfig } from '@renderer/constants/states'

interface ActiveRepositoryProps {
	repo: GithubRepo
	onBack: () => void
}

export const ActiveRepository: React.FC<ActiveRepositoryProps> = ({ repo, onBack }) => {
	const [filesToDelete, setFilesToDelete] = useState<FilesType[]>([])
	const { getCurrentSession, setSessionRepository, setSessionFiles, removeSessionFiles } =
		useSessions()
	const {
		error,
		customMessage,
		onClose,
		setDifferentRepository,
		setInvalidRepository,
		setCustomMessage,
	} = useErrors()

	const currentSession = getCurrentSession(repo.id)
	const sessionState: States = currentSession?.state ?? 'disconnected'

	const handleSelectFolder = async () => {
		onClose()
		const repository = await window.electron.selectFolder()

		if (!repository.valid) {
			setInvalidRepository()
			return
		}

		if (repository.url && repository.url !== repo.clone_url) {
			setCustomMessage(repository.url)
			setDifferentRepository()
			return
		}

		setSessionRepository(repo.id, repository)
	}

	const handleSelectFiles = async () => {
		if (!currentSession || !currentSession?.repository) return
		const files = await window.electron.selectFiles(currentSession?.repository?.path)
		setSessionFiles(repo.id, files)
	}

	const onDelete = (files: FilesType[]) => {
		removeSessionFiles(repo.id, files)
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
				</div>

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
			</div>
			{error && (
				<ErrorFallback error={error} onClose={onClose}>
					{error === Errors.DIFFERENT_REPOSITORY && (
						<div className="space-y-4">
							<div>
								<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
									Expected remote
								</p>

								<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
									<code className="break-all font-mono text-xs text-zinc-700">
										{repo.clone_url}
									</code>
								</div>
							</div>

							<div>
								<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
									Selected local repository
								</p>

								<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
									<code className="break-all font-mono text-xs text-zinc-700">{customMessage}</code>
								</div>
							</div>
						</div>
					)}
				</ErrorFallback>
			)}
			{currentSession?.repository ? (
				<Card className="flex flex-1 w-full flex-col overflow-hidden">
					<div className="flex items-center justify-between border-b border-zinc-200 p-5">
						<div>
							<h2 className="font-semibold text-zinc-900">Repository Files</h2>

							<p className="mt-1 text-sm text-zinc-500">Files selected for synchronization</p>
						</div>

						<div className="flex items-center justify-center gap-2">
							{Boolean(currentSession.files?.length) && (
								<div className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
									{currentSession.files?.length} selected
								</div>
							)}
							{Boolean(filesToDelete.length) && (
								<button
									type="button"
									onClick={() => onDelete(filesToDelete)}
									className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-all hover:bg-red-50 hover:text-red-600"
								>
									<Trash2 size={15} />
								</button>
							)}
						</div>
					</div>
					{currentSession.files && (
						<Files
							files={currentSession.files}
							onDelete={onDelete}
							filesToDelete={filesToDelete}
							setFilesToDelete={setFilesToDelete}
						/>
					)}
					<AddFiles onClick={handleSelectFiles} full={Boolean(!currentSession.files)} />
				</Card>
			) : (
				<Card className="flex flex-1 min-h-0 w-full flex-col items-center justify-center p-10">
					<div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-sky-100 text-sky-700">
						<FolderOpen size={46} />
					</div>

					<h2 className="mt-8 text-2xl font-semibold">No local folder linked</h2>

					<p className="mt-3 max-w-lg text-center leading-7 text-zinc-500">
						Select the folder where this repository exists on your computer. Share-it will monitor
						changes and synchronize files automatically.
					</p>

					<button
						type="button"
						className="mt-8 flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 font-medium text-white transition hover:bg-black"
						onClick={handleSelectFolder}
					>
						<FolderCode size={18} />
						Select Local Folder
					</button>
				</Card>
			)}
		</div>
	)
}
