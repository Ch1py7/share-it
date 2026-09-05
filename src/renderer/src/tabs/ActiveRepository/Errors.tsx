import { ErrorFallback } from '@renderer/components/ErrorFallback'
import { REPOSITORY_ERRORS } from '@renderer/constants/errors'
import { GithubRepo } from '@renderer/stores/user/user.types'

interface ErrorsProps {
	error: REPOSITORY_ERRORS | null
	onClose: () => void
	repo: GithubRepo
	customMessage: string
}

export const Errors: React.FC<ErrorsProps> = ({ error, onClose, repo, customMessage }) => {
	if (!error) return null
	return (
		<ErrorFallback error={error} onClose={onClose}>
			{error === REPOSITORY_ERRORS.DIFFERENT_REPOSITORY && (
				<div className="space-y-4">
					<div>
						<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
							Expected remote
						</p>

						<div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
							<code className="break-all font-mono text-xs text-zinc-700">{repo.clone_url}</code>
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
	)
}
