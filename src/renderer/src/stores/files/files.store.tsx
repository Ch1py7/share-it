import { create } from 'zustand'
import { FilesState, RepositoryTransfers } from './files.types'

export const useFilesStore = create<FilesState>()((set, get) => ({
	transfers: new Map(),
	addTransfer: (repoId, batchId, files, status, sender) => {
		const next = new Map(get().transfers)

		const currentRepoMap: RepositoryTransfers = next.get(repoId)
			? new Map(next.get(repoId))
			: new Map()

		currentRepoMap.set(batchId, {
			files,
			createdAt: Date.now(),
			status,
			senderId: sender?.id,
			senderName: sender?.name,
		})
		next.set(repoId, currentRepoMap)
		set({ transfers: next })
	},
	setTransferStatus: (repoId, batchId, status) => {
		const currentRepoMap = get().transfers.get(repoId)
		const batch = currentRepoMap?.get(batchId)
		if (!currentRepoMap || !batch) return

		const next = new Map(get().transfers)
		const updatedRepoMap = new Map(currentRepoMap)
		updatedRepoMap.set(batchId, { ...batch, status })
		next.set(repoId, updatedRepoMap)
		set({ transfers: next })
	},
}))
