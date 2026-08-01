import { sessionStateConfig } from '@renderer/constants/states'
import { useSessions } from '@renderer/context/sessions/sessions.context'
import { cn } from '@renderer/lib/utils'

export const CurrentSessions = () => {
	const { sessionsStateQty } = useSessions()

	const sessionsStates = Object.entries(sessionsStateQty)

	return (
		<div className="p-3 space-y-2 z-10 rounded-xl border border-zinc-200 bg-zinc-50">
			{sessionsStates.map(([key, value]) => {
				if (!value) return null
				return (
					<div key={key} className="flex items-center justify-between text-sm">
						<div className="flex items-center gap-2">
							<div className={cn('h-2 w-2 rounded-full', sessionStateConfig[key].color)} />
							<span>{sessionStateConfig[key].label}</span>
						</div>

						<span className="font-semibold">{value}</span>
					</div>
				)
			})}
		</div>
	)
}
