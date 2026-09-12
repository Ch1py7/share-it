import { Files as FilesType } from '@renderer/stores/sessions/sessions.types'
import { cn, formatWithCommas, sizePrefix } from '@renderer/lib/utils'
import { FileCode, LockKeyhole, Send, Trash2 } from 'lucide-react'
import { Session } from '@renderer/stores/sessions/sessions.types'
import { Tooltip } from '@renderer/components/Tooltip'
import { useFilesStore } from '@renderer/stores/files/files.store'
import { useMemo } from 'react'
import { PendingSynchronization } from '@renderer/components/tooltips/PendingSynchronization'
interface FilesProps {
	repoId: number
	currentSession: Session
	onDelete: (files: FilesType[]) => void
	selectedFiles: FilesType[]
	setSelectedFiles: React.Dispatch<React.SetStateAction<FilesType[]>>
}

export const Files: React.FC<FilesProps> = ({
	repoId,
	currentSession,
	onDelete,
	selectedFiles,
	setSelectedFiles,
}) => {
	const currentTransfer = useFilesStore((state) => state.transfers.get(repoId))
	const currentFilePathsSet = useMemo(() => {
		if (!currentTransfer) return new Set<string>()

		const filePaths = Array.from(currentTransfer.values()).flatMap((batch) => batch.filePaths)
		return new Set(filePaths)
	}, [currentTransfer])

	const toggleFileSelection = (file: FilesType) => {
		setSelectedFiles((prev) => {
			if (prev.some((p) => p.id === file.id)) {
				return prev.filter((arr) => arr.id !== file.id)
			}
			return [...prev, file]
		})
	}

	const handleSendFiles = () => {
		const currentFiles = selectedFiles.length !== 0 ? selectedFiles : currentSession.files
		const files = currentFiles.map((file) => ({ filename: file.name, id: file.id }))
		window.electron.socket.shareFiles({ files, repoId: repoId.toString() })
		setSelectedFiles([])
	}

	const isPendingSync = (fileId: string) => currentFilePathsSet.has(fileId)

	return (
		<div className="flex-1 overflow-y-auto relative">
			{currentSession.files.map((file) => {
				const isPending = isPendingSync(file.id)
				return (
					<div
						key={file.relativePath}
						className={cn(
							'flex items-center justify-between border-b border-zinc-100 border-l-2 px-5 py-3 transition',
							isPending
								? 'border-l-amber-400 bg-amber-50/40'
								: 'border-l-transparent hover:bg-zinc-50'
						)}
					>
						<div className="flex items-center gap-3">
							<input
								type="checkbox"
								checked={selectedFiles.includes(file)}
								onChange={() => toggleFileSelection(file)}
							/>
							<FileCode size={18} className={isPending ? 'text-zinc-400' : 'text-zinc-500'} />

							<div className={isPending ? 'text-zinc-500' : 'text-zinc-900'}>
								<div className="flex items-center gap-2">
									<p className="font-medium">{file.name}</p>

									{isPending && (
										<Tooltip
											content={<PendingSynchronization />}
											tooltipClassNames="w-64 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 shadow-lg"
											position="right"
											align="center"
										>
											<span className="rounded-md bg-zinc-200 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500">
												Pending
											</span>
										</Tooltip>
									)}
								</div>

								<p className="text-xs text-zinc-400">{file.relativePath}</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<span className="min-w-20 text-right text-sm text-zinc-500">
								{formatWithCommas(file.size)}
								{sizePrefix(file.size)}
							</span>

							{isPending ? (
								<Tooltip
									content="This file is pending synchronization and cannot be removed."
									tooltipClassNames="w-56 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 shadow-lg"
									align="right"
								>
									<div className="flex h-8 w-8 items-center justify-center rounded-lg text-amber-500">
										<LockKeyhole size={15} />
									</div>
								</Tooltip>
							) : (
								<button
									type="button"
									onClick={() => onDelete([file])}
									className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-all hover:bg-red-50 hover:text-red-600"
								>
									<Trash2 size={15} />
								</button>
							)}
						</div>
					</div>
				)
			})}

			<Tooltip
				className="absolute bottom-5 right-8"
				content="Start a session before sending anything"
				disabled={currentSession.state === 'connected'}
				tooltipClassNames="p-3 space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-600 shadow-lg w-[200%]"
				align="right"
			>
				<button
					type="button"
					className="flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
					disabled={currentSession.state !== 'connected' || !currentSession.files?.length}
					onClick={handleSendFiles}
				>
					<Send size={16} />
					Sync
				</button>
			</Tooltip>
		</div>
	)
}
