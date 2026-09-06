import { CrownIcon, Lock, User } from 'lucide-react'
import { Modal } from './Modal'
import { RoleCard } from './RoleCard'
import { GithubRepo } from '@renderer/stores/user/user.types'
import { SessionRole } from '@renderer/stores/sessions/sessions.types'
import { useSessionsStore } from '@renderer/stores/sessions/sessions.store'

interface CreateSessionModalProps {
	isOpen: boolean
	onCancel: () => void
	selectedRepo: GithubRepo
}

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
	isOpen,
	onCancel,
	selectedRepo,
}) => {
	const addSession = useSessionsStore((state) => state.addSession)
	const onClick = (repoId: number, role: SessionRole) => {
		addSession(repoId, role)
		onCancel()
	}

	return (
		<Modal open={isOpen} onClose={onCancel}>
			<div className="mx-auto max-w-5xl">
				<div className="mb-8 text-center">
					<h1 className="text-3xl font-bold tracking-tight">Choose your role</h1>

					<p className="mt-2 text-zinc-500">
						Select how you want to use Share-it during this session.
					</p>
				</div>

				<div className="mb-8">
					<div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-5 py-4">
						<p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
							Selected repository
						</p>

						<div className="mt-2 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<img
									src={selectedRepo.owner.avatar_url}
									alt={selectedRepo.owner.login}
									className="h-10 w-10 rounded-full"
								/>

								<div>
									<h2 className="font-semibold text-zinc-900">{selectedRepo.name}</h2>

									<p className="text-sm text-zinc-500">
										{selectedRepo.owner.login}
										{selectedRepo.private && (
											<>
												<span className="mx-2">•</span>
												<Lock size={12} className="inline mr-1" />
												Private
											</>
										)}
									</p>
								</div>
							</div>

							<div className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-500">
								{selectedRepo.language ?? 'Unknown'}
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-6">
					<button type="button" onClick={() => onClick(selectedRepo.id, 'collaborator')}>
						<RoleCard
							title="Collaborator"
							description="Access repositories shared with you and synchronize files."
							icon={<User />}
							iconStyle="bg-sky-100 text-sky-700"
						/>
					</button>
					<button type="button" onClick={() => onClick(selectedRepo.id, 'owner')}>
						<RoleCard
							title="Repository Owner"
							description="Share repositories, invite collaborators and manage permissions."
							icon={<CrownIcon />}
							iconStyle="bg-violet-100 text-violet-700"
						/>
					</button>
				</div>
				<div className="mt-4 flex justify-end">
					<button
						type="button"
						onClick={onCancel}
						className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 transition-all hover:bg-zinc-100 hover:text-zinc-900"
					>
						Cancel
					</button>
				</div>
			</div>
		</Modal>
	)
}
