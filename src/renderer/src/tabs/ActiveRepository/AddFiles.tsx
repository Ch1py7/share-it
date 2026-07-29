import { cn } from '@renderer/lib/utils'
import { FolderCode } from 'lucide-react'

interface AddFilesProps {
	onClick: () => Promise<void>
	full?: boolean
}

export const AddFiles: React.FC<AddFilesProps> = ({ onClick, full }) => {
	return (
		<div className={cn('border-t border-zinc-200 p-8', full && 'h-full')}>
			<div
				className={cn(
					'hidden lg:flex items-center justify-center flex-col rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-10 text-center transition hover:border-zinc-300',
					full && 'h-full'
				)}
			>
				<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
					<FolderCode size={28} />
				</div>

				<h3 className="mt-5 font-semibold">Add files to synchronize</h3>

				<p className="mt-2 text-sm text-zinc-500">
					Drag & drop files here or browse your computer.
				</p>

				<button
					type="button"
					onClick={onClick}
					className="mt-6 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-black"
				>
					Select Files
				</button>
			</div>
			<div className="lg:hidden flex items-center gap-4">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
					<FolderCode size={28} />
				</div>

				<div>
					<h3 className="mt-5 font-semibold">Add files to synchronize</h3>
					<p className="mt-2 text-sm text-zinc-500">
						Drag & drop files here or browse your computer.
					</p>
				</div>

				<button
					type="button"
					onClick={onClick}
					className="rounded-lg ms-auto border bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
				>
					Select Files
				</button>
			</div>
		</div>
	)
}
