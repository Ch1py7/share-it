export const PendingSynchronization = () => {
	return (
		<div className="space-y-1">
			<p className="font-medium text-zinc-900">Pending synchronization</p>
			<p>
				This file belongs to a sync batch and can't be removed until it's released from the batch.
			</p>
		</div>
	)
}
