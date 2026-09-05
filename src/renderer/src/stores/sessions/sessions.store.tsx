import { SessionsState } from './sessions.types'
import { mergeFiles } from '@renderer/lib/utils'
import { create } from 'zustand'

export const useSessionsStore = create<SessionsState>()((set, get) => ({
	sessions: new Map(),
	addSession: (repositoryId, role) => {
		const next = new Map(get().sessions)
		next.set(repositoryId, {
			role,
			state: 'disconnected',
			files: [],
		})
		set({ sessions: next })
	},
	removeSession: (repositoryId) => {
		const next = new Map(get().sessions)
		next.delete(repositoryId)
		set({ sessions: next })
	},
	getCurrentSession: (repositoryId) => get().sessions.get(repositoryId),
	hasSession: (repositoryId) => get().sessions.has(repositoryId),
	setSessionRepository: (repositoryId, repository) => {
		const prev = get().sessions
		const current = prev.get(repositoryId)

		if (!current) {
			set({ sessions: prev })
			return
		}

		const next = new Map(prev)
		next.set(repositoryId, {
			...current,
			repository,
			state: 'pending',
		})
		set({ sessions: next })
	},
	setSessionFiles: (repositoryId, files) => {
		const prev = get().sessions
		const current = prev.get(repositoryId)
		if (!current) {
			set({ sessions: prev })
			return
		}

		const next = new Map(prev)

		next.set(repositoryId, {
			...current,
			files: mergeFiles(current.files ?? [], files),
		})

		set({ sessions: next })
	},

	removeSessionFiles: (repositoryId, deletedFiles) => {
		const prev = get().sessions
		const current = prev.get(repositoryId)
		if (!current) {
			set({ sessions: prev })
			return
		}
		const rest = current.files.filter(
			(f) => !deletedFiles.map((d) => d.relativePath).includes(f.relativePath)
		)

		const next = new Map(prev)

		next.set(repositoryId, {
			...current,
			files: rest,
		})

		set({ sessions: next })
	},

	setSessionState: (repositoryId, state) => {
		const prev = get().sessions
		const current = prev.get(repositoryId)
		if (!current) {
			set({ sessions: prev })
			return
		}
		const next = new Map(prev)

		next.set(repositoryId, {
			...current,
			state,
		})

		set({ sessions: next })
	},
	getSessionsStateQty: () => {
		const counts = { connected: 0, disconnected: 0, loading: 0, error: 0, pending: 0 }
		for (const session of get().sessions.values()) {
			if (counts[session.state] !== undefined) counts[session.state]++
		}

		return counts
	},
}))
