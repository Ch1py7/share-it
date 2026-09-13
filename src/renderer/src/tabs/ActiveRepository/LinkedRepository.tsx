import { Card } from '@renderer/components/Card'
import { useSessionsStore } from '@renderer/stores/sessions/sessions.store'
import { GithubRepo } from '@renderer/stores/user/user.types'
import { Files as FilesType } from '@renderer/stores/sessions/sessions.types'
import { Send, Trash2 } from 'lucide-react'
import { Files } from './Files'
import { useState } from 'react'
import { AddFiles } from './AddFiles'
import { useCurrentSession } from '@renderer/hooks/sessions/useCurrentSession'
import { useShallow } from 'zustand/shallow'
import { ErrorFallback } from '@renderer/components/ErrorFallback'
import { useErrors } from '@renderer/hooks/useErrors'
import { Tooltip } from '@renderer/components/Tooltip'

interface LinkedRepositoryProps {
	repo: GithubRepo
	hoveredFileIds: Set<string>
}

export const LinkedRepository: React.FC<LinkedRepositoryProps> = ({ repo, hoveredFileIds }) => {
	const [selectedFiles, setSelectedFiles] = useState<FilesType[]>([])
	const { removeSessionFiles, setSessionFiles } = useSessionsStore(
		useShallow((state) => ({
			removeSessionFiles: state.removeSessionFiles,
			setSessionFiles: state.setSessionFiles,
		}))
	)
	const { error, onClose, setInvalidFiles } = useErrors()
	const currentSession = useCurrentSession(repo.id)!
	const onDeleteFiles = (files: FilesType[]) => {
		removeSessionFiles(repo.id, files)
	}
	const handleSelectFiles = async () => {
		if (!currentSession || !currentSession?.repository) return
		const files = await window.electron.selectFiles(repo.id)
		if (files.some((f) => f.error)) {
			setInvalidFiles()
			return
		}
		if (!files.length) return
		setSessionFiles(repo.id, files)
	}

	const handleSendFiles = () => {
		const currentFiles = selectedFiles.length !== 0 ? selectedFiles : currentSession.files
		const files = currentFiles.map((file) => ({ filename: file.name, id: file.id }))
		window.electron.socket.shareFiles({ files, repoId: repo.id.toString() })
		setSelectedFiles([])
	}

	return (
		<>
			{error && <ErrorFallback error={error} onClose={onClose} />}
			<Card className="flex w-full flex-col">
				<div className="flex items-center justify-between p-5">
					<div>
						<h2 className="font-semibold text-zinc-900">Repository Files</h2>

						<p className="mt-1 text-sm text-zinc-500">Files selected for synchronization</p>
					</div>

					<div className="flex items-center justify-center gap-2">
						{Boolean(currentSession.files.length) && (
							<Tooltip
								content="Start a session before sending anything"
								disabled={currentSession.state === 'connected'}
								tooltipClassNames="w-64 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600 shadow-lg"
								position="left"
								align="center"
							>
								<button
									type="button"
									className="flex items-center gap-2 rounded-xl border border-sky-600/20 bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-600 hover:shadow active:scale-[0.98] disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none disabled:cursor-not-allowed"
									disabled={currentSession.state !== 'connected' || !currentSession.files?.length}
									onClick={handleSendFiles}
								>
									<Send size={15} strokeWidth={2.2} />
									Sync{' '}
									{selectedFiles.length
										? `(${selectedFiles.length})`
										: `(${currentSession.files.length})`}
								</button>
							</Tooltip>
						)}

						{Boolean(selectedFiles.length) && (
							<>
								<div className="h-5 w-px bg-zinc-200" />

								<div className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
									{selectedFiles.length} selected
								</div>

								<button
									type="button"
									onClick={() => onDeleteFiles(selectedFiles)}
									className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-all hover:bg-red-50 hover:text-red-600"
								>
									<Trash2 size={15} />
								</button>
							</>
						)}
					</div>
				</div>
				{currentSession.files.length !== 0 && (
					<Files
						repoId={repo.id}
						currentSession={currentSession}
						onDelete={onDeleteFiles}
						selectedFiles={selectedFiles}
						setSelectedFiles={setSelectedFiles}
						hoveredFileIds={hoveredFileIds}
					/>
				)}
				<AddFiles onClick={handleSelectFiles} full={currentSession.files.length === 0} />
			</Card>
		</>
	)
}
