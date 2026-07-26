export type SessionRole = 'owner' | 'collaborator'

export interface Session {
  role: SessionRole
  state: 'disconnected' | 'error' | 'connected' | 'loading'
}

export interface SessionsContextType {
  sessions: Map<number, Session>
  addSession: (projectId: number, role: SessionRole) => void
}