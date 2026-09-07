export interface ConnectSession {
	repositoryName: string
	repoId: string
	username: string
	userId: number
}

export type DisconnectSession = Omit<ConnectSession, 'userId'>

type States = 'disconnected' | 'error' | 'connected' | 'loading' | 'pending'

export interface ShareFiles {
	repoId: string
	files: { filename: string; id: string }[]
}

export interface AcceptFiles {
	batchId: string
	senderId: string
}

export interface CreateTunnel {
	receiverId: string
	batchId: string
}

export interface ServerToClientEvents {
	notification: (data: { title: string; description: string }) => void
	'session:notification': (data: { title: string; description: string }) => void
	status: (data: { repoId: string; status: States }) => void
	'session:files-offer-received': (data: {
		batchId: string
		filenames: string[]
		senderId: string
		senderName: string
	}) => void
	'session:peer-requested-data': (data: { batchId: string }) => void
	'session:error': (data: { message: string }) => void
	'session:files-delivery': (data: { batchId: string }) => void
	'session:files-to-send': (data: { batchId: string; repoId: string }) => void
	'session:batch': (data: { repoId: string; batchId: string; filesIds: string[] }) => void
}

export interface ClientToServerEvents {
	'session:connect': (data: ConnectSession) => void
	'session:disconnect': (data: DisconnectSession) => void
	'session:share-files': (data: ShareFiles) => void
	'session:accept-files': (data: AcceptFiles) => void
	'session:create-tunnel': (data: CreateTunnel) => void
}
