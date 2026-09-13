import { Card } from '@renderer/components/Card'
import { useSessionsStore } from '@renderer/stores/sessions/sessions.store'
import { GithubRepo } from '@renderer/stores/user/user.types'
import { FolderCode, FolderOpen } from 'lucide-react'

interface UnlinkedRepositoryProps {
	onClose: () => void
	setInvalidRepository: () => void
	setCustomMessage: (value: string) => void
	setDifferentRepository: () => void
	repo: GithubRepo
}

export const UnlinkedRepository: React.FC<UnlinkedRepositoryProps> = ({
	onClose,
	setCustomMessage,
	setDifferentRepository,
	setInvalidRepository,
	repo,
}) => {
	const setSessionRepository = useSessionsStore((state) => state.setSessionRepository)

	const handleSelectFolder = async () => {
		onClose()
		const repository = await window.electron.selectFolder(repo.id)
		if (!repository) return

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

	return (
		<Card className="flex min-h-0 w-full flex-col items-center justify-center">
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
	)
}
