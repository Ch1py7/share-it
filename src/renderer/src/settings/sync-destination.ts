export type SyncDestination = 'repository' | 'share-it'

const storageKey = (userId: string) => `share-it:sync-destination:${userId}`

export const getSyncDestination = (userId?: string): SyncDestination => {
	if (!userId) return 'repository'
	return localStorage.getItem(storageKey(userId)) === 'share-it' ? 'share-it' : 'repository'
}

export const setSyncDestination = (userId: string, destination: SyncDestination): void => {
	localStorage.setItem(storageKey(userId), destination)
}
