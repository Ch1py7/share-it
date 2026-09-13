import { Files as FilesType } from '@renderer/stores/sessions/sessions.types'
import { cn, formatFileSize } from '@renderer/lib/utils'
import { FileCode, LockKeyhole, Trash2 } from 'lucide-react'
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
	const currentTransfers = useFilesStore((state) => state.transfers.get(repoId))
	const currentFilePathsSet = useMemo(() => {
		if (!currentTransfers) return new Set<string>()

		const filePaths = Array.from(currentTransfers.values()).flatMap((batch) => batch.filePaths)
		return new Set(filePaths)
	}, [currentTransfers])

	const toggleFileSelection = (file: FilesType) => {
		setSelectedFiles((prev) => {
			if (prev.some((p) => p.id === file.id)) {
				return prev.filter((arr) => arr.id !== file.id)
			}
			return [...prev, file]
		})
	}

	const isPendingSync = (relativePath: string) => currentFilePathsSet.has(relativePath)

	return (
		<div className="flex-1 overflow-y-auto">
			{currentSession.files.map((file) => {
				const isPending = isPendingSync(file.relativePath)
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
								{formatFileSize(file.size)}
							</span>

							{isPending ? (
								<Tooltip
									content="This file is pending synchronization and cannot be removed."
									tooltipClassNames="w-56 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 shadow-lg"
									align="center"
									position="left"
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
		</div>
	)
}
