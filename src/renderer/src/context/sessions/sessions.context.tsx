import { createContext, useContext, useState } from 'react'
import { Session, SessionRole, SessionsContextType } from './sessions.type'
import { mergeFiles } from '@renderer/lib/utils'

const SessionsContext = createContext<SessionsContextType | null>(null)

export function SessionsProvider({ children }: { children: React.ReactNode }) {
	const [sessions, setSessions] = useState<Map<number, Session>>(new Map())

	const addSession = (repositoryId: number, role: SessionRole) => {
		setSessions((prev) => {
			const next = new Map(prev)
			next.set(repositoryId, {
				role,
				state: 'disconnected',
			})
			return next
		})
	}

	const getCurrentSession = (repositoryId: number) => sessions.get(repositoryId)

	const hasSession = (repositoryId: number) => sessions.has(repositoryId)

	const setSessionRepository = (repositoryId: number, repository: Session['repository']) => {
		setSessions((prev) => {
			const current = prev.get(repositoryId)
			if (!current) return prev

			const next = new Map(prev)
			next.set(repositoryId, {
				...current,
				repository,
			})

			return next
		})
	}

	const setSessionFiles = (repositoryId: number, files: Session['files']) => {
		setSessions((prev) => {
			const current = prev.get(repositoryId)

			if (!current) return prev

			const next = new Map(prev)

			next.set(repositoryId, {
				...current,
				files: mergeFiles(current.files ?? [], files ?? []),
			})

			return next
		})
	}

	return (
		<SessionsContext.Provider
			value={{
				sessions,
				addSession,
				getCurrentSession,
				hasSession,
				setSessionRepository,
				setSessionFiles,
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
