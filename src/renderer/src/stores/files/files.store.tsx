import { create } from 'zustand'
import { FilesState, RepositoryTransfers } from './files.types'

export const useFilesStore = create<FilesState>()((set, get) => ({
	transfers: new Map(),
	addTransfer: (repoId, batchId, filePaths) => {
		const next = new Map(get().transfers)

		const currentRepoMap: RepositoryTransfers = next.get(repoId)
			? new Map(next.get(repoId))
			: new Map()

		currentRepoMap.set(batchId, { filePaths, createdAt: Date.now() })
		next.set(repoId, currentRepoMap)
		set({ transfers: next })
	},
	getFilesInTransfer: (repoId) => {
		const currentTransfers = get().transfers.get(repoId)
		if (!currentTransfers) return []
		const transfersArr = Array.from(currentTransfers)

		return transfersArr.map(([batchId, batch]) => ({ batchId, filePaths: batch.filePaths }))
	},
}))
