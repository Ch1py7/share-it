import { Card } from '@renderer/components/Card'
import { useCurrentSession } from '@renderer/hooks/sessions/useCurrentSession'
import { toast } from 'sonner'

interface SharingPermissionsProps {
	repoId: number
}

export const SharingPermissions: React.FC<SharingPermissionsProps> = ({ repoId }) => {
	const session = useCurrentSession(repoId)
	const collaborators = session?.members.filter((member) => member.role === 'collaborator') ?? []

	const setSharingPermission = (targetSocketId: string, canShare: boolean) => {
		window.electron.socket
			.setSharingPermission({ repoId: repoId.toString(), targetSocketId, canShare })
			.catch((error) =>
				toast.error('Could not update sharing permission', { description: String(error) })
			)
	}

	return (
		<Card className="flex w-full flex-col">
			<div className="border-b border-zinc-200 px-5 py-4">
				<h2 className="font-semibold text-zinc-900">Sharing permissions</h2>
				<p className="mt-1 text-sm text-zinc-500">
					Choose which connected collaborators can publish files to this session.
				</p>
			</div>
			{collaborators.length > 0 ? (
				<div className="divide-y divide-zinc-100">
					{collaborators.map((member) => (
						<label
							key={member.socketId}
							className="flex items-center justify-between gap-4 px-5 py-4"
						>
							<div>
								<p className="text-sm font-medium text-zinc-900">{member.username}</p>
								<p className="text-xs text-zinc-500">Can share files</p>
							</div>
							<input
								type="checkbox"
								checked={member.canShare}
								disabled={session?.state !== 'connected'}
								onChange={(event) => setSharingPermission(member.socketId, event.target.checked)}
								className="h-4 w-4 accent-violet-600 disabled:cursor-not-allowed"
							/>
						</label>
					))}
				</div>
			) : (
				<div className="flex flex-1 items-center justify-center px-8 py-12 text-center">
					<p className="max-w-sm text-sm text-zinc-500">
						No collaborators are connected. Their sharing controls will appear here when they join.
					</p>
				</div>
			)}
		</Card>
	)
}
