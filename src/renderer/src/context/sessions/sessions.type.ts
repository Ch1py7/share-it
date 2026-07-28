export type SessionRole = 'owner' | 'collaborator'

export interface Session {
	role: SessionRole
	state: 'disconnected' | 'error' | 'connected' | 'loading'
	repository?: {
		path: string
		valid: boolean
		name?: string
		version?: string
		shareIt?: boolean
		url?: string
	}
	files?: SessionFile[]
}

export interface SessionFile {
	name: string
	relativePath: string
	content: string
	hash: string
	size: number
}

export interface SessionsContextType {
	sessions: Map<number, Session>
	addSession: (repositoryId: number, role: SessionRole) => void
	getCurrentSession: (repositoryId: number) => Session | undefined
	hasSession: (repositoryId: number) => boolean
	setSessionRepository: (repositoryId: number, repository: Session['repository']) => void
	setSessionFiles: (repositoryId: number, files: Session['files']) => void
}
