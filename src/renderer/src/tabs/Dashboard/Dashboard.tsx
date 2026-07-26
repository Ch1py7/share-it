import { RepositoryCard } from '@renderer/tabs/Dashboard/RepositoryCard'
import { GithubRepo } from '@renderer/context/user.types'

interface DashboardProps {
	repos: GithubRepo[]
	onClick: (repo: GithubRepo) => void
}

export const Dashboard: React.FC<DashboardProps> = ({ repos, onClick }) =>
	repos.map((repo) => <RepositoryCard key={repo.id} repo={repo} onClick={onClick} />)
