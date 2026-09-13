import { Files } from '../sessions/sessions.types'

type Status = 'sent' | 'received' | 'pending'

interface TransferBatch {
	status: Status
	files: Files[]
	createdAt: number
}

// Map<batchId, interface>
export type RepositoryTransfers = Map<string, TransferBatch>

// Map<repoId, interface>
type TransfersState = Map<number, RepositoryTransfers>

export interface FilesState {
	transfers: TransfersState
	addTransfer: (repoId: number, batchId: string, files: Files[], status: Status) => void
}
