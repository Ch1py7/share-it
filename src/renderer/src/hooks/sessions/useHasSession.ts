import { useSessionsStore } from '@renderer/stores/sessions/sessions.store'

export const useHasSession = (repoId?: number) => {
	return useSessionsStore((state) => (repoId ? state.sessions.has(repoId) : false))
}
