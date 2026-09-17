import { SessionsState } from './sessions.types'
import { mergeFiles } from '@renderer/lib/utils'
import { create } from 'zustand'

export const useSessionsStore = create<SessionsState>()((set, get) => ({
	sessions: new Map(),
	addSession: (repoId, role) => {
		const next = new Map(get().sessions)
		next.set(repoId, {
			role,
			canShare: role === 'owner',
			members: [],
			state: 'disconnected',
			files: [],
		})
		set({ sessions: next })
	},
	removeSession: (repoId) => {
		const next = new Map(get().sessions)
		next.delete(repoId)
		set({ sessions: next })
	},
	setSessionRepository: (repoId, repository) => {
		const prev = get().sessions
		const current = prev.get(repoId)
		if (!current) return

		const next = new Map(prev)
		next.set(repoId, {
			...current,
			repository,
			state: 'pending',
		})
		set({ sessions: next })
	},
	setSessionFiles: (repoId, files) => {
		const prev = get().sessions
		const current = prev.get(repoId)
		if (!current) return

		const next = new Map(prev)

		next.set(repoId, {
			...current,
			files: mergeFiles(current.files ?? [], files),
		})

		set({ sessions: next })
	},

	removeSessionFiles: (repoId, files) => {
		const prev = get().sessions
		const current = prev.get(repoId)
		if (!current) return

		const deletedFiles = new Set(files.map((d) => d.id))

		const rest = current.files.filter((f) => !deletedFiles.has(f.id))

		const next = new Map(prev)
		next.set(repoId, { ...current, files: rest })
		set({ sessions: next })
	},

	setSessionState: (repoId, state) => {
		const prev = get().sessions
		const current = prev.get(repoId)
		if (!current) return

		const next = new Map(prev)

		next.set(repoId, {
			...current,
			state,
		})

		set({ sessions: next })
	},
	setSessionMembers: (repoId, members, currentUserId) => {
		const current = get().sessions.get(repoId)
		if (!current) return
		const self = members.find((member) => member.userId === currentUserId)
		const next = new Map(get().sessions)
		next.set(repoId, {
			...current,
			members,
			role: self?.role ?? current.role,
			canShare: self?.canShare ?? current.canShare,
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
