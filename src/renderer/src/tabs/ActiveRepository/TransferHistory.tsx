import { Card } from '@renderer/components/Card'
import { Tooltip } from '@renderer/components/Tooltip'
import { formatFileSize } from '@renderer/lib/utils'
import { useFilesStore } from '@renderer/stores/files/files.store'
import {
	CheckCircle2,
	CircleX,
	ClockFading,
	Download,
	FileCode2,
	History,
	LoaderCircle,
	Send,
} from 'lucide-react'
import { useMemo } from 'react'

interface TransferHistoryProps {
	repoId: number
	setHoveredFileIds: React.Dispatch<React.SetStateAction<Set<string>>>
}

const transferStatus = {
	synchronizing: {
		icon: LoaderCircle,
		label: 'Synchronizing',
		tooltip: 'The selected files are being sent',
		className: 'bg-amber-50 text-amber-700',
		description: 'Files are being synchronized by another user',
		iconClassName: 'bg-amber-50 text-amber-600',
	},
	receiving: {
		icon: Download,
		label: 'Receiving',
		tooltip: 'The selected files are still being received',
		className: 'bg-violet-50 text-violet-700',
		description: 'Files are being received from another user',
		iconClassName: 'bg-violet-50 text-violet-600',
	},
	failed: {
		icon: CircleX,
		label: 'Failed',
		tooltip: 'The synchronization could not be completed',
		className: 'bg-red-50 text-red-700',
		description: 'The synchronization failed',
		iconClassName: 'bg-red-50 text-red-600',
	},
	sent: {
		icon: Send,
		label: 'Sent',
		tooltip: '',
		className: 'bg-sky-50 text-sky-700',
		description: 'Files synchronized by another user',
		iconClassName: 'bg-sky-50 text-sky-600',
	},
	received: {
		icon: CheckCircle2,
		label: 'Received',
		tooltip: '',
		className: 'bg-emerald-50 text-emerald-700',
		description: 'You synchronized files from another user',
		iconClassName: 'bg-emerald-50 text-emerald-600',
	},
} as const

export const TransferHistory: React.FC<TransferHistoryProps> = ({ repoId, setHoveredFileIds }) => {
	const currentTransfers = useFilesStore((state) => state.transfers.get(repoId))

	const transfers = useMemo(() => {
		if (!currentTransfers) return []

		return [...currentTransfers.entries()].reverse()
	}, [currentTransfers])

	return (
		<Card className="flex max-w-sm w-full flex-col overflow-hidden">
			<div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
				<div className="flex items-center gap-3">
					<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
						<ClockFading size={18} />
					</div>

					<div>
						<h2 className="text-sm font-semibold text-zinc-900">Transfer history</h2>

						<p className="text-xs text-zinc-500">Who synchronized which files</p>
					</div>
				</div>

				{Boolean(transfers.length) && (
					<div className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
						{transfers.length} transfers
					</div>
				)}
			</div>

			{transfers.length ? (
				<div className="divide-y divide-zinc-100">
					{transfers.map(([id, batch]) => {
						const status = transferStatus[batch.status]
						const StatusIcon = status.icon

						return (
							<div
								role="none"
								onMouseEnter={() => setHoveredFileIds(new Set(batch.files.map((file) => file.id)))}
								onMouseLeave={() => setHoveredFileIds(new Set())}
								key={id}
								className="px-5 py-4 transition-colors hover:bg-zinc-50"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<div
													className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${status.iconClassName}`}
												>
													<StatusIcon size={15} />
												</div>

												<div className="min-w-0">
													<div className="flex items-center gap-2">
														<p className="text-sm font-medium text-zinc-900">Synchronization</p>

														<span className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
															#{id.slice(6, 16)}
														</span>
													</div>

													<p className="mt-0.5 text-xs text-zinc-500">
														{batch.senderName
															? `${batch.status === 'sent' ? 'Synchronized by' : 'From'} ${batch.senderName} · `
															: ''}
														{new Date(batch.createdAt).toLocaleString()}
													</p>
												</div>
											</div>

											<div className="flex shrink-0 flex-col items-end">
												<Tooltip
													content={status.tooltip}
													tooltipClassNames="w-56 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600 shadow-lg"
													align="center"
													position="left"
													disabled={!status.tooltip.length}
												>
													<span
														className={`rounded-lg px-2 py-1 text-xs font-medium ${status.className}`}
													>
														{status.label}
													</span>
												</Tooltip>

												<span className="text-xs text-zinc-400">
													{batch.files.length} {batch.files.length === 1 ? 'file' : 'files'}
												</span>
											</div>
										</div>

										<div className="mt-4 space-y-1.5 pl-9">
											{batch.files.map((file) => (
												<div
													key={file.id}
													className="flex min-w-0 items-center gap-4 text-xs text-zinc-500"
												>
													<div className="flex min-w-0 flex-1 items-center gap-2">
														<FileCode2 size={13} className="shrink-0 text-zinc-400" />

														<span className="truncate">{file.relativePath}</span>
													</div>

													<span className="ml-auto min-w-16 shrink-0 text-right text-zinc-400">
														{file.hash ? formatFileSize(file.size) : '—'}
													</span>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						)
					})}
				</div>
			) : (
				<div className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center">
					<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
						<History size={22} />
					</div>

					<p className="mt-4 text-sm font-medium text-zinc-800">No transfers yet</p>

					<p className="mt-1 max-w-56 text-xs leading-5 text-zinc-500">
						Synchronization activity will appear here after a file is downloaded.
					</p>
				</div>
			)}
		</Card>
	)
}
