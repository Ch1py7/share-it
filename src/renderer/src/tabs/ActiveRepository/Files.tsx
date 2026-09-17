import { Files as FilesType } from '@renderer/stores/sessions/sessions.types'
import { cn, formatFileSize } from '@renderer/lib/utils'
import { FileCode, RefreshCw, Trash2 } from 'lucide-react'
import { Session } from '@renderer/stores/sessions/sessions.types'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
interface FilesProps {
	repoId: number
	currentSession: Session
	onDelete: (files: FilesType[]) => void
	selectedFiles: FilesType[]
	setSelectedFiles: React.Dispatch<React.SetStateAction<FilesType[]>>
	hoveredFileIds: Set<string>
}

export const Files: React.FC<FilesProps> = ({
	repoId,
	currentSession,
	onDelete,
	selectedFiles,
	setSelectedFiles,
	hoveredFileIds,
}) => {
	const listRef = useRef<HTMLDivElement>(null)
	const fileRowRefs = useRef(new Map<string, HTMLDivElement>())
	const [syncingFileIds, setSyncingFileIds] = useState(new Set<string>())

	useEffect(() => {
		if (!hoveredFileIds.size) return

		const firstHoveredFile = currentSession.files.find((file) => hoveredFileIds.has(file.id))
		const list = listRef.current
		const row = firstHoveredFile && fileRowRefs.current.get(firstHoveredFile.id)
		if (!list || !row) return

		list.scrollTo({
			top: list.scrollTop + row.getBoundingClientRect().top - list.getBoundingClientRect().top,
			behavior: 'smooth',
		})
	}, [hoveredFileIds, currentSession.files])

	const toggleFileSelection = (file: FilesType) => {
		setSelectedFiles((prev) => {
			if (prev.some((p) => p.id === file.id)) {
				return prev.filter((arr) => arr.id !== file.id)
			}
			return [...prev, file]
		})
	}

	const syncFile = async (file: FilesType) => {
		if (!file.sourceId || !file.sourceFileId) return
		setSyncingFileIds((current) => new Set(current).add(file.id))
		try {
			await window.electron.socket.syncFiles({
				repoId: repoId.toString(),
				senderId: file.sourceId,
				filesIds: [file.sourceFileId],
			})
			toast.info(`Synchronizing ${file.name}…`)
		} catch (error) {
			toast.error('Could not synchronize file', { description: String(error) })
		} finally {
			setSyncingFileIds((current) => {
				const next = new Set(current)
				next.delete(file.id)
				return next
			})
		}
	}

	return (
		<div ref={listRef} className="flex-1 overflow-y-auto">
			{currentSession.files.map((file) => {
				const isRemote = Boolean(file.sourceId)
				const isSyncing = syncingFileIds.has(file.id)
				const isHighlighted = hoveredFileIds.has(file.id)
				return (
					<div
						key={file.id}
						ref={(element) => {
							if (element) fileRowRefs.current.set(file.id, element)
							else fileRowRefs.current.delete(file.id)
						}}
						className={cn(
							'flex items-center justify-between border-b border-zinc-100 border-l-2 px-5 py-3 transition',
							isHighlighted
								? 'border-l-sky-500 bg-sky-50 ring-1 ring-inset ring-sky-200'
								: isRemote
									? 'border-l-sky-300 bg-sky-50/30'
									: 'border-l-transparent hover:bg-zinc-50'
						)}
					>
						<div className="flex items-center gap-3">
							{!isRemote && currentSession.canShare && (
								<input
									type="checkbox"
									checked={selectedFiles.includes(file)}
									onChange={() => toggleFileSelection(file)}
								/>
							)}
							<FileCode size={18} className="text-zinc-500" />

							<div className="text-zinc-900">
								<div className="flex items-center gap-2">
									<p className="font-medium">{file.name}</p>

									{isRemote && (
										<span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
											{file.sourceName}
										</span>
									)}
								</div>

								<p className="text-xs text-zinc-400">{file.relativePath}</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<span className="min-w-20 text-right text-sm text-zinc-500">
								{formatFileSize(file.size)}
							</span>

							{isRemote ? (
								<button
									type="button"
									disabled={isSyncing || currentSession.state !== 'connected'}
									onClick={() => syncFile(file)}
									className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:bg-zinc-300"
								>
									<RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
									{isSyncing ? 'Syncing' : 'Sync'}
								</button>
							) : currentSession.canShare ? (
								<button
									type="button"
									onClick={() => onDelete([file])}
									className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-all hover:bg-red-50 hover:text-red-600"
								>
									<Trash2 size={15} />
								</button>
							) : null}
						</div>
					</div>
				)
			})}
		</div>
	)
}
