export interface ConnectSession {
	repositoryName: string
	repoId: string
	username: string
	userId: number
	role: 'owner' | 'collaborator'
}

export type DisconnectSession = Omit<ConnectSession, 'userId' | 'role'>

type States = 'disconnected' | 'error' | 'connected' | 'loading' | 'pending'

export interface ShareFiles {
	repoId: string
	files: SharedFile[]
}

export interface SyncFiles {
	repoId: string
	senderId: string
	filesIds: string[]
}

export interface RemoveFiles {
	repoId: string
	filesIds: string[]
}

export interface RequestCatalog {
	repoId: string
}

export interface CreateTunnel {
	receiverId: string
	receiverName: string
	batchId: string
	repoId: string
	filesIds: string[]
}

export interface SharedFile {
	id: string
	name: string
	relativePath: string
	hash: string
	size: number
}

export interface ServerToClientEvents {
	notification: (data: { title: string; description: string }) => void
	'session:notification': (data: { title: string; description: string }) => void
	status: (data: { repoId: string; status: States }) => void
	'session:files-published': (data: {
		repoId: string
		files: SharedFile[]
		senderId: string
		senderName: string
	}) => void
	'session:files-removed': (data: { repoId: string; senderId: string; filesIds?: string[] }) => void
	'session:catalog-requested': (data: { repoId: string }) => void
	'session:catalog-refreshing': (data: { repoId: string }) => void
	'session:peer-requested-data': (data: CreateTunnel) => void
	'session:error': (data: { message: string }) => void
	'session:files-delivery': (data: {
		batchId: string
		repoId: string
		filesIds: string[]
		senderId: string
		senderName: string
	}) => void
	'session:files-to-send': (data: {
		batchId: string
		repoId: string
		filesIds: string[]
		receiverId: string
		receiverName: string
	}) => void
}

export interface ClientToServerEvents {
	'session:connect': (data: ConnectSession) => void
	'session:disconnect': (data: DisconnectSession) => void
	'session:share-files': (data: ShareFiles) => void
	'session:remove-files': (data: RemoveFiles) => void
	'session:request-catalog': (data: RequestCatalog) => void
	'session:sync-files': (data: SyncFiles) => void
	'session:create-tunnel': (data: CreateTunnel) => void
}
