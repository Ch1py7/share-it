import { RepositoryCard } from '@renderer/tabs/Dashboard/RepositoryCard'
import { GithubRepo } from '@renderer/stores/user/user.types'

interface DashboardProps {
	repos: GithubRepo[]
	onClick: (repo: GithubRepo) => void
}

export const Repositories: React.FC<DashboardProps> = ({ repos, onClick }) => (
	<div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 px-6 py-4">
		{repos.map((repo) => (
			<RepositoryCard key={repo.id} repo={repo} onClick={onClick} />
		))}
	</div>
)
