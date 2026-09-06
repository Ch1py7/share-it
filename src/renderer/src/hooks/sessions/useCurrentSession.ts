import { useSessionsStore } from '@renderer/stores/sessions/sessions.store'

export const useCurrentSession = (repoId: number) => {
	return useSessionsStore((state) => state.sessions.get(repoId))
}
