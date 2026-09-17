export type SessionRole = 'owner' | 'collaborator'

export interface Session {
	role: SessionRole
	canShare: boolean
	members: SessionMember[]
	state: States
	repository?: Repository
	files: Files[]
}

export interface SessionMember {
	socketId: string
	userId: string
	username: string
	role: SessionRole
	canShare: boolean
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
	id: string
	name: string
	relativePath: string
	hash: string
	size: number
	sourceId?: string
	sourceName?: string
	sourceFileId?: string
}

export type States = 'disconnected' | 'error' | 'connected' | 'loading' | 'pending'

export type SessionsStateQty = Record<States, number>

export interface SessionsState {
	sessions: Map<number, Session>
	addSession: (repoId: number, role: SessionRole) => void
	removeSession: (repoId: number) => void
	setSessionRepository: (repoId: number, repository: Session['repository']) => void
	setSessionFiles: (repoId: number, files: Files[]) => void
	removeSessionFiles: (repoId: number, files: Files[]) => void
	setSessionState: (repoId: number, state: States) => void
	setSessionMembers: (repoId: number, members: SessionMember[], currentUserId: string) => void
	getSessionsStateQty: () => SessionsStateQty
}
