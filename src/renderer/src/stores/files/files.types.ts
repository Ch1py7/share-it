interface TransferBatch {
	// status: string
	filesIds: string[]
	createdAt: number
}

// Map<filePackageId, interface>
export type RepositoryTransfers = Map<string, TransferBatch>

// Map<repoId, interface>
type TransfersState = Map<number, RepositoryTransfers>

export interface FilesState {
	transfers: TransfersState
	addTransfer: (repoId: number, batchId: string, filesIds: string[]) => void
	getFilesInTransfer: (repoId: number) => {
		batchId: string
		filesIds: string[]
	}[]
}
