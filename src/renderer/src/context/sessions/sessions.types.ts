export type SessionRole = 'owner' | 'collaborator'

export interface Session {
	role: SessionRole
	state: States
	repository?: Repository
	files?: Files[]
}

export interface Repository {
	path: string
	valid: boolean
	name?: string
	version?: string
	shareIt?: boolean
	url?: string
}

export interface Files {
	name: string
	relativePath: string
	content: string
	hash: string
	size: number
}

export type States = 'disconnected' | 'error' | 'connected' | 'loading' | 'pending'

type SessionsStateQty = Record<States, number>
export interface SessionsContextType {
	sessions: Map<number, Session>
	sessionsStateQty: SessionsStateQty
	addSession: (repositoryId: number, role: SessionRole) => void
	getCurrentSession: (repositoryId: number) => Session | undefined
	hasSession: (repositoryId: number) => boolean
	setSessionRepository: (repositoryId: number, repository: Session['repository']) => void
	setSessionFiles: (repositoryId: number, files: Files[]) => void
	removeSessionFiles: (repositoryId: number, files: Files[]) => void
	setSessionState: (repositoryId: number, state: States) => void
}
