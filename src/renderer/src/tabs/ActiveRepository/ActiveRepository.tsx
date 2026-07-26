import { useSessions } from '@renderer/context/sessions/sessions.context'
import { GithubRepo } from '@renderer/context/user.types'
import { ArrowLeft } from 'lucide-react'

interface ActiveRepositoryProps {
	repo: GithubRepo
	onBack: () => void
}

export const ActiveRepository: React.FC<ActiveRepositoryProps> = ({ repo, onBack }) => {
	const { sessions } = useSessions()
	return (
		<div>
			<div className="flex">
				<button type="button" onClick={onBack} className="flex gap-2">
					<ArrowLeft /> Back
				</button>
				<p>Repository: {repo.full_name}</p>
				{sessions.get(repo.id)?.state}
			</div>
		</div>
	)
}
