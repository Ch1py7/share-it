import { Files as FilesType } from '@renderer/context/sessions/sessions.types'
import { formatWithCommas, sizePrefix } from '@renderer/lib/utils'
import { FileCode, Trash2 } from 'lucide-react'

interface FilesProps {
	files: FilesType[] | undefined
	onDelete: (files: FilesType[]) => void
	filesToDelete: FilesType[]
	setFilesToDelete: React.Dispatch<React.SetStateAction<FilesType[]>>
}

export const Files: React.FC<FilesProps> = ({
	files,
	onDelete,
	filesToDelete,
	setFilesToDelete,
}) => {
	const handleFilesToDelete = (file: FilesType) => {
		setFilesToDelete((prev) => {
			const newArr = prev
			if (prev.some((p) => p.relativePath === file.relativePath)) {
				return newArr.filter((arr) => arr.relativePath !== file.relativePath)
			}
			return [...prev, file]
		})
	}

	return (
		<div className="flex-1 overflow-y-auto">
			{files?.map((file) => (
				<div
					key={file.relativePath}
					className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 transition hover:bg-zinc-50"
				>
					<div className="flex items-center gap-3">
						<input
							type="checkbox"
							checked={filesToDelete.includes(file)}
							onChange={() => handleFilesToDelete(file)}
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
		</div>
	)
}
