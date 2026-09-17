import { useState } from 'react'
import {
	getSyncDestination,
	setSyncDestination,
	type SyncDestination,
} from '@renderer/settings/sync-destination'

interface SyncDestinationSettingProps {
	userId: string
}

export const SyncDestinationSetting = ({ userId }: SyncDestinationSettingProps) => {
	const [destination, setDestination] = useState<SyncDestination>(() => getSyncDestination(userId))

	const selectDestination = (next: SyncDestination) => {
		setSyncDestination(userId, next)
		setDestination(next)
	}

	return (
		<section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
			<h2 className="text-base font-semibold text-zinc-900">File synchronization</h2>
			<p className="mt-1 text-sm text-zinc-500">
				Choose where received files are saved for all your repositories.
			</p>
			<div className="mt-5 space-y-3">
				<label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 p-4">
					<input
						type="radio"
						name="sync-destination"
						checked={destination === 'repository'}
						onChange={() => selectDestination('repository')}
						className="mt-1 accent-zinc-900"
					/>
					<span>
						<span className="block text-sm font-medium text-zinc-900">Original paths</span>
						<span className="block text-sm text-zinc-500">
							Write files directly to their relative paths in the repository.
						</span>
					</span>
				</label>
				<label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zinc-200 p-4">
					<input
						type="radio"
						name="sync-destination"
						checked={destination === 'share-it'}
						onChange={() => selectDestination('share-it')}
						className="mt-1 accent-zinc-900"
					/>
					<span>
						<span className="block text-sm font-medium text-zinc-900">share-it folder</span>
						<span className="block text-sm text-zinc-500">
							Save files under the repository's share-it folder, keeping their relative paths.
						</span>
					</span>
				</label>
			</div>
		</section>
	)
}
