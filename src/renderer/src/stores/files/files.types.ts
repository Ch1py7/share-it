interface TransferBatch {
	// status: string
	filePaths: string[]
	createdAt: number
}

// Map<batchId, interface>
export type RepositoryTransfers = Map<string, TransferBatch>

// Map<repoId, interface>
type TransfersState = Map<number, RepositoryTransfers>

export interface FilesState {
	transfers: TransfersState
	addTransfer: (repoId: number, batchId: string, filePaths: string[]) => void
	getFilesInTransfer: (repoId: number) => {
		batchId: string
		filePaths: string[]
	}[]
}
