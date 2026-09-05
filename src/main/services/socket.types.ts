export interface ConnectSession {
	repositoryName: string
	repoId: string
	username: string
	userId: number
}

type DisconnectSession = Omit<ConnectSession, 'userId'>

type States = 'disconnected' | 'error' | 'connected' | 'loading' | 'pending'

interface ShareFiles {
	repoId: string
	filenames: string
}

interface AcceptFiles {
	offerId: string
	senderId: string
}

interface DeliverFilesPayload {
	receiverId: string
	filenames: string
	fileContent: string
}

export interface ServerToClientEvents {
	notification: (data: { title: string; description: string }) => void
	'session:notification': (data: { title: string; description: string }) => void
	status: (data: { repoId: string; status: States }) => void
	'session:files-offer-received': (data: {
		offerId: string
		filenames: string
		senderId: string
		senderName: string
	}) => void
	'session:peer-requested-data': (data: {
		offerId: string
		receiverId: string
		senderName: string
	}) => void
	'session:error': (data: { message: string }) => void
	'session:files-delivery': (data: { filenames: string; fileContent: string }) => void
}

export interface ClientToServerEvents {
	'session:connect': (data: ConnectSession) => void
	'session:disconnect': (data: DisconnectSession) => void
	'session:share-files': (data: ShareFiles) => void
	'session:accept-files': (data: AcceptFiles) => void
	'session:deliver-files-payload': (data: DeliverFilesPayload) => void
}
