import { create } from 'zustand'
import { FilesState, RepositoryTransfers } from './files.types'

export const useFilesStore = create<FilesState>()((set, get) => ({
	transfers: new Map(),
	addTransfer: (repoId, batchId, files, status) => {
		const next = new Map(get().transfers)

		const currentRepoMap: RepositoryTransfers = next.get(repoId)
			? new Map(next.get(repoId))
			: new Map()

		currentRepoMap.set(batchId, { files, createdAt: Date.now(), status })
		next.set(repoId, currentRepoMap)
		set({ transfers: next })
	},
}))
