import { Files } from '../sessions/sessions.types'

type Status = 'synchronizing' | 'receiving' | 'sent' | 'received' | 'failed'

interface TransferBatch {
	status: Status
	files: Files[]
	createdAt: number
	senderId?: string
	senderName?: string
}

// Map<batchId, interface>
export type RepositoryTransfers = Map<string, TransferBatch>

// Map<repoId, interface>
type TransfersState = Map<number, RepositoryTransfers>

export interface FilesState {
	transfers: TransfersState
	addTransfer: (
		repoId: number,
		batchId: string,
		files: Files[],
		status: Status,
		sender?: { id: string; name: string }
	) => void
	setTransferStatus: (repoId: number, batchId: string, status: Status) => void
}
