import { useSessions } from '@renderer/context/sessions/sessions.context'
import { cn } from '@renderer/lib/utils'

export const CurrentSessions = () => {
	const { sessions } = useSessions()
	const connected = [...sessions.values()].filter((session) => session.state === 'connected').length

	const loading = [...sessions.values()].filter((session) => session.state === 'loading').length

	const error = [...sessions.values()].filter((session) => session.state === 'error').length

	const disconnected = [...sessions.values()].filter(
		(session) => session.state === 'disconnected'
	).length

	return (
		<div
			className={cn(
				'rounded-xl border border-zinc-200 bg-zinc-50',
				'absolute top-full mt-2 opacity-0 translate-y-2',
				'pointer-events-none transition-all duration-200',
				'group-hover:opacity-100 group-hover:translate-y-0',
				'group-hover:pointer-events-auto w-full'
			)}
		>
			<div className="p-3 space-y-2">
				{connected !== 0 && (
					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 rounded-full bg-emerald-500" />
							<span>Connected</span>
						</div>

						<span className="font-semibold">{connected}</span>
					</div>
				)}

				{loading !== 0 && (
					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 rounded-full bg-sky-500" />
							<span>Loading</span>
						</div>

						<span className="font-semibold">{loading}</span>
					</div>
				)}

				{error !== 0 && (
					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 rounded-full bg-red-500" />
							<span>Error</span>
						</div>

						<span className="font-semibold">{error}</span>
					</div>
				)}

				{disconnected !== 0 && (
					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center gap-2">
							<div className="h-2 w-2 rounded-full bg-zinc-400" />
							<span>Disconnected</span>
						</div>

						<span className="font-semibold">{disconnected}</span>
					</div>
				)}
			</div>
		</div>
	)
}
