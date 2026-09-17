import { GithubRepo, User } from './user.types'
import { create } from 'zustand'
import { toast } from 'sonner'

interface UserState {
	accessToken: string | null
	user: User | null
	repos: GithubRepo[]
	loading: boolean
	reposLoading: boolean
	hasMoreRepos: boolean
	nextReposPage: number
	logout: () => Promise<void>
	setUser: (user: User | null) => void
	setRepos: (repos: GithubRepo[]) => void
	fetchRepos: (refresh?: boolean) => Promise<boolean>
	setAccessToken: (accessToken: string) => void
	setLoading: (loading: boolean) => void
	clear: () => void
}

export const useUserStore = create<UserState>()((set, get) => ({
	accessToken: null,
	user: null,
	repos: [],
	loading: true,
	reposLoading: false,
	hasMoreRepos: true,
	nextReposPage: 1,
	logout: async () => {
		try {
			const response = await window.electron.be.logout()
			if (response.success) toast.success('Signed out successfully')
			else
				toast.error('Could not complete sign out on the server', {
					description: response.error.message,
				})
		} catch {
			toast.error('Could not contact the server while signing out')
		} finally {
			await window.electron.socket.disconnect()
			set({
				user: null,
				repos: [],
				accessToken: null,
				hasMoreRepos: true,
				nextReposPage: 1,
			})
		}
	},
	setUser: (user) => {
		set({ user })
	},
	setRepos: (repos) => {
		set({ repos })
	},
	fetchRepos: async (refresh = false) => {
		const state = get()
		if (!state.user) return false
		if (state.reposLoading || (!refresh && !state.hasMoreRepos)) return false

		const page = refresh ? 1 : state.nextReposPage
		set({ reposLoading: true })

		try {
			const response = await window.electron.be.getRepos({ page, per_page: 30 })
			if (!response.success) {
				toast.error('Could not load repositories', { description: response.error.message })
				return false
			}

			const incomingRepos = response.data as GithubRepo[]
			set((current) => {
				const currentIds = new Set(current.repos.map((repo) => repo.id))
				const addedRepos = incomingRepos.filter((repo) => !currentIds.has(repo.id))
				const repos = refresh
					? incomingRepos
					: Array.from(
							new Map([...current.repos, ...incomingRepos].map((repo) => [repo.id, repo])).values()
						)

				return {
					repos,
					hasMoreRepos: incomingRepos.length === 30 && (refresh || addedRepos.length > 0),
					nextReposPage: page + 1,
				}
			})
			return true
		} catch {
			toast.error('Could not contact the server while loading repositories')
			return false
		} finally {
			set({ reposLoading: false })
		}
	},
	setAccessToken: (accessToken) => {
		set({ accessToken })
	},
	setLoading: (loading) => {
		set({ loading })
	},
	clear: () => {
		set({
			accessToken: '',
			user: null,
			repos: [],
			loading: false,
			reposLoading: false,
			hasMoreRepos: true,
			nextReposPage: 1,
		})
	},
}))
