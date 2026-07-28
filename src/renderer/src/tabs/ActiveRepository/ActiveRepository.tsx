import { Card } from '@renderer/components/Card'
import { ErrorFallback } from '@renderer/components/ErrorFallback'
import { Errors } from '@renderer/constants/errors'
import { useSessions } from '@renderer/context/sessions/sessions.context'
import { GithubRepo } from '@renderer/context/user.types'
import { useErrors } from '@renderer/hooks/useErrors'
import { formatWithCommas } from '@renderer/lib/utils'
import { ArrowLeft, FileCode, FolderCode, FolderOpen } from 'lucide-react'

interface ActiveRepositoryProps {
	repo: GithubRepo
	onBack: () => void
}

export const ActiveRepository: React.FC<ActiveRepositoryProps> = ({ repo, onBack }) => {
	const { getCurrentSession, setSessionRepository, setSessionFiles } = useSessions()
	const {
		error,
		customMessage,
		onClose,
		setDifferentRepository,
		setInvalidRepository,
		setCustomMessage,
	} = useErrors()

	const currentSession = getCurrentSession(repo.id)

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

					<div>
						<h1 className="text-2xl font-bold tracking-tight">{repo.name}</h1>

						<p className="text-sm text-zinc-500">{repo.full_name}</p>
					</div>
				</div>

				<div className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
					<div className="h-2 w-2 rounded-full bg-emerald-500" />
					{currentSession?.state}
				</div>
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

						<div className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
							{currentSession.files?.length} selected
						</div>
					</div>
					<div className="flex-1 overflow-y-auto">
						{currentSession.files?.map((file) => (
							<div
								key={file.relativePath}
								className="flex items-center justify-between border-b border-zinc-100 px-5 py-3 transition hover:bg-zinc-50"
							>
								<div className="flex items-center gap-3">
									<FileCode className="text-zinc-500" size={18} />

									<div>
										<p className="font-medium">{file.name}</p>

										<p className="text-xs text-zinc-500">{file.relativePath}</p>
									</div>
								</div>

								<p className="text-sm text-zinc-500">{formatWithCommas(file.size)}</p>
							</div>
						))}
					</div>

					<div className="border-t border-zinc-200 p-8">
						<div className="hidden lg:block rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-10 text-center transition hover:border-zinc-300">
							<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
								<FolderCode size={28} />
							</div>

							<h3 className="mt-5 font-semibold">Add files to synchronize</h3>

							<p className="mt-2 text-sm text-zinc-500">
								Drag & drop files here or browse your computer.
							</p>

							<button
								type="button"
								onClick={handleSelectFiles}
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
								onClick={handleSelectFiles}
								className="rounded-lg ms-auto border bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
							>
								Select Files
							</button>
						</div>
					</div>
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
