import { useSessions } from '@renderer/context/sessions/sessions.context'

export const CurrentSessions = () => {
	const { sessionsStateQty } = useSessions()

	return (
		<div className="p-3 space-y-2 z-10 rounded-xl border border-zinc-200 bg-zinc-50">
			{sessionsStateQty.connected !== 0 && (
				<div className="flex items-center justify-between text-sm">
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-emerald-500" />
						<span>Connected</span>
					</div>

					<span className="font-semibold">{sessionsStateQty.connected}</span>
				</div>
			)}

			{sessionsStateQty.pending !== 0 && (
				<div className="flex items-center justify-between text-sm">
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-sky-500" />
						<span>Pending</span>
					</div>

					<span className="font-semibold">{sessionsStateQty.pending}</span>
				</div>
			)}

			{sessionsStateQty.error !== 0 && (
				<div className="flex items-center justify-between text-sm">
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-red-500" />
						<span>Error</span>
					</div>

					<span className="font-semibold">{sessionsStateQty.error}</span>
				</div>
			)}

			{sessionsStateQty.disconnected !== 0 && (
				<div className="flex items-center justify-between text-sm">
					<div className="flex items-center gap-2">
						<div className="h-2 w-2 rounded-full bg-zinc-400" />
						<span>Disconnected</span>
					</div>

					<span className="font-semibold">{sessionsStateQty.disconnected}</span>
				</div>
			)}
		</div>
	)
}
