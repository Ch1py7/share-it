import { FolderInput } from 'lucide-react'
import { getSyncDestination } from '@renderer/settings/sync-destination'
import { Tooltip } from '@renderer/components/Tooltip'

const trailingSeparator = /[\\/]$/

interface ReceiveDestinationNoticeProps {
	repositoryPath: string
	userId?: string
}

export const ReceiveDestinationNotice = ({
	repositoryPath,
	userId,
}: ReceiveDestinationNoticeProps) => {
	const destination = getSyncDestination(userId)
	const separator = repositoryPath.includes('\\') ? '\\' : '/'
	const targetPath =
		destination === 'share-it'
			? `${repositoryPath}${trailingSeparator.test(repositoryPath) ? '' : separator}share-it`
			: repositoryPath

	return (
		<Tooltip
			position="bottom"
			tooltipClassNames="w-72"
			content={
				<div className="rounded-xl border border-zinc-200 bg-white p-3 text-xs font-normal text-zinc-600 shadow-lg">
					<p>Files you receive from other people are saved here:</p>
					<p className="mt-1 break-all font-medium text-zinc-900">{targetPath}</p>
					<p className="mt-2">
						{destination === 'share-it'
							? 'Their folder structure is kept inside the share-it folder.'
							: 'Their folder structure is kept in the repository. Existing files at those paths may be replaced.'}
					</p>
					<p className="mt-2">Change this for all repositories in Settings (gear icon above).</p>
				</div>
			}
		>
			<div className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-800">
				<FolderInput size={14} className="shrink-0" />
				<span>
					Received files go to{' '}
					{destination === 'share-it' ? 'the share-it folder' : 'this repository'}
				</span>
			</div>
		</Tooltip>
	)
}
