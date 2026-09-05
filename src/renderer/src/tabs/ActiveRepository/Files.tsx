import { Files as FilesType } from '@renderer/stores/sessions/sessions.types'
import { formatWithCommas, sizePrefix } from '@renderer/lib/utils'
import { FileCode, Send, Trash2 } from 'lucide-react'
import { Session } from '@renderer/stores/sessions/sessions.types'
import { Tooltip } from '@renderer/components/Tooltip'
interface FilesProps {
	repoId: number
	currentSession: Session
	onDelete: (files: FilesType[]) => void
	filesToDelete: FilesType[]
	setFilesToDelete: React.Dispatch<React.SetStateAction<FilesType[]>>
}

export const Files: React.FC<FilesProps> = ({
	repoId,
	currentSession,
	onDelete,
	filesToDelete,
	setFilesToDelete,
}) => {
	const deleteFiles = (file: FilesType) => {
		setFilesToDelete((prev) => {
			const newArr = prev
			if (prev.some((p) => p.relativePath === file.relativePath)) {
				return newArr.filter((arr) => arr.relativePath !== file.relativePath)
			}
			return [...prev, file]
		})
	}

	const handleSendFiles = async () => {
		const file = currentSession.files[0]
		await window.electron.socket.shareFiles({ filenames: file.name, repoId: repoId.toString() })
	}

	return (
		<div className="flex-1 overflow-y-auto relative">
			{currentSession.files.map((file) => (
				<div
					key={file.relativePath}
					className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 transition hover:bg-zinc-50"
				>
					<div className="flex items-center gap-3">
						<input
							type="checkbox"
							checked={filesToDelete.includes(file)}
							onChange={() => deleteFiles(file)}
						/>
						<FileCode className="text-zinc-500" size={18} />

						<div>
							<p className="font-medium">{file.name}</p>

							<p className="text-xs text-zinc-500">{file.relativePath}</p>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<span className="min-w-20 text-right text-sm text-zinc-500">
							{formatWithCommas(file.size)}
							{sizePrefix(file.size)}
						</span>

						<button
							type="button"
							onClick={() => onDelete([file])}
							className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-all hover:bg-red-50 hover:text-red-600"
						>
							<Trash2 size={15} />
						</button>
					</div>
				</div>
			))}

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
