import { createContext, useContext } from 'react'
import { Session, SessionRole, SessionsContextType } from './sessions.type'

const SessionsContext = createContext<SessionsContextType | null>(null)

export function SessionsProvider({ children }: { children: React.ReactNode }) {
	const sessions = new Map<number, Session>()

	const addSession = (projectId: number, role: SessionRole) => {
		sessions.set(projectId, { role, state: 'disconnected' })
	}

	return (
		<SessionsContext.Provider
			value={{
				sessions,
				addSession,
			}}
		>
			{children}
		</SessionsContext.Provider>
	)
}

export const useSessions = () => {
	const ctx = useContext(SessionsContext)

	if (!ctx) throw Error

	return ctx
}
