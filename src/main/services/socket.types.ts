interface ConnectSessionCommand {
	repositoryName: string
	repoId: string
	username: string
	userId: number
}

type DisconnectSessionCommand = Omit<ConnectSessionCommand, 'userId'>

type STATES = 'disconnected' | 'error' | 'connected' | 'loading' | 'pending'

export interface ServerToClientEvents {
	notification: (data: { title: string; description: string }) => void
	status: (data: { repoId: string; status: STATES }) => void
	'session:notification': (data: { title: string; description: string }) => void
}

export interface ClientToServerEvents {
	'session:connect': (data: ConnectSessionCommand) => void
	'session:disconnect': (data: DisconnectSessionCommand) => void
}
