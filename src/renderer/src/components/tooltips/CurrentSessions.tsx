import { sessionStateConfig } from '@renderer/constants/states'
import { cn } from '@renderer/lib/utils'
import { useSessionsStore } from '@renderer/stores/sessions/sessions.store'
import { useMemo } from 'react'

export const CurrentSessions = () => {
	const sessions = useSessionsStore((state) => state.sessions)
	const counts = useMemo(() => {
		const totalCounts = { connected: 0, disconnected: 0, loading: 0, error: 0, pending: 0 }

		for (const session of sessions.values()) {
			if (totalCounts[session.state] !== undefined) {
				totalCounts[session.state]++
			}
		}

		return totalCounts
	}, [sessions])
	const sessionsStates = Object.entries(counts)
	return (
		<div className="p-3 space-y-2 rounded-xl border border-zinc-200 bg-zinc-50">
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
