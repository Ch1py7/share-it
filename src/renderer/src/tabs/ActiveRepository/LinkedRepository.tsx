import { Card } from '@renderer/components/Card'
import { useSessionsStore } from '@renderer/stores/sessions/sessions.store'
import { GithubRepo } from '@renderer/stores/user/user.types'
import { Files as FilesType } from '@renderer/stores/sessions/sessions.types'
import { Trash2 } from 'lucide-react'
import { Files } from './Files'
import { useState } from 'react'
import { AddFiles } from './AddFiles'
import { useCurrentSession } from '@renderer/hooks/sessions/useCurrentSession'
import { useShallow } from 'zustand/shallow'
import { ErrorFallback } from '@renderer/components/ErrorFallback'
import { useErrors } from '@renderer/hooks/useErrors'

interface LinkedRepositoryProps {
	repo: GithubRepo
}

export const LinkedRepository: React.FC<LinkedRepositoryProps> = ({ repo }) => {
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

	return (
		<>
			{error && <ErrorFallback error={error} onClose={onClose} />}
			<Card className="flex flex-1 w-full flex-col overflow-hidden">
				<div className="flex items-center justify-between border-b border-zinc-200 p-5">
					<div>
						<h2 className="font-semibold text-zinc-900">Repository Files</h2>

						<p className="mt-1 text-sm text-zinc-500">Files selected for synchronization</p>
					</div>

					<div className="flex items-center justify-center gap-2">
						{Boolean(selectedFiles.length) && (
							<div className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
								{selectedFiles.length} selected
							</div>
						)}
						{Boolean(selectedFiles.length) && (
							<button
								type="button"
								onClick={() => onDeleteFiles(selectedFiles)}
								className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-all hover:bg-red-50 hover:text-red-600"
							>
								<Trash2 size={15} />
							</button>
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
					/>
				)}
				<AddFiles onClick={handleSelectFiles} full={currentSession.files.length === 0} />
			</Card>
		</>
	)
}
