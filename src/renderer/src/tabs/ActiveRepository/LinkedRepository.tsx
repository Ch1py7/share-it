import { Card } from '@renderer/components/Card'
import { useSessionsStore } from '@renderer/stores/sessions/sessions.store'
import { GithubRepo } from '@renderer/stores/user/user.types'
import { Files as FilesType } from '@renderer/stores/sessions/sessions.types'
import { RefreshCw, Trash2 } from 'lucide-react'
import { Files } from './Files'
import { useState } from 'react'
import { AddFiles } from './AddFiles'
import { useCurrentSession } from '@renderer/hooks/sessions/useCurrentSession'
import { useShallow } from 'zustand/shallow'
import { ErrorFallback } from '@renderer/components/ErrorFallback'
import { useErrors } from '@renderer/hooks/useErrors'
import { toast } from 'sonner'

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
		const localFileIds = files.filter((file) => !file.sourceId).map((file) => file.id)
		if (localFileIds.length && currentSession.state === 'connected') {
			window.electron.socket
				.removeFiles({
					repoId: repo.id.toString(),
					filesIds: localFileIds,
				})
				.catch((error) =>
					toast.error('Could not remove shared files', { description: String(error) })
				)
		}
		removeSessionFiles(repo.id, files)
		setSelectedFiles((selected) => selected.filter((file) => !localFileIds.includes(file.id)))
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
		setSelectedFiles([])
		const sharedFiles = files.map(({ id, name, relativePath, hash, size }) => ({
			id,
			name,
			relativePath,
			hash,
			size,
		}))
		if (currentSession.state === 'connected') {
			window.electron.socket
				.shareFiles({ files: sharedFiles, repoId: repo.id.toString() })
				.catch((error) =>
					toast.error('Could not share selected files', { description: String(error) })
				)
		}
	}
	const handleRefreshFiles = async () => {
		try {
			await window.electron.socket.requestCatalog({ repoId: repo.id.toString() })
			toast.info('Refreshing available files…')
		} catch (error) {
			toast.error('Could not refresh available files', { description: String(error) })
		}
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
						<button
							type="button"
							onClick={handleRefreshFiles}
							disabled={currentSession.state !== 'connected'}
							className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400"
							title="Ask connected users for their latest files"
						>
							<RefreshCw size={15} />
							Refresh files
						</button>
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
				{currentSession.role === 'owner' && (
					<AddFiles onClick={handleSelectFiles} full={currentSession.files.length === 0} />
				)}
				{currentSession.role === 'collaborator' && currentSession.files.length === 0 && (
					<div className="flex flex-1 items-center justify-center px-8 py-12 text-center">
						<p className="max-w-sm text-sm text-zinc-500">
							No files are currently available. Refresh the catalog or wait for the owner to share
							files.
						</p>
					</div>
				)}
			</Card>
		</>
	)
}
