import { FolderInput } from 'lucide-react'
import { getSyncDestination } from '@renderer/settings/sync-destination'

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
		<div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
			<FolderInput size={18} className="mt-0.5 shrink-0" />
			<div className="min-w-0">
				<p className="font-medium">
					Received files go to{' '}
					{destination === 'share-it' ? 'the share-it folder' : 'their original paths'}
				</p>
				<p className="mt-0.5 break-all text-sky-700">{targetPath}</p>
			</div>
		</div>
	)
}
