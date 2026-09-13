import { GithubRepo, User } from './user.types'
import { create } from 'zustand'
import { toast } from 'sonner'

interface UserState {
	accessToken: string | null
	user: User | null
	repos: GithubRepo[] | null
	loading: boolean
	logout: () => Promise<void>
	setUser: (user: User | null) => void
	setRepos: (repos: GithubRepo[]) => void
	setAccessToken: (accessToken: string) => void
	setLoading: (loading: boolean) => void
	clear: () => void
}

export const useUserStore = create<UserState>()((set) => ({
	accessToken: null,
	user: null,
	repos: null,
	loading: true,
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
			set({
				user: null,
				repos: [],
				accessToken: null,
			})
		}
	},
	setUser: (user) => {
		set({ user })
	},
	setRepos: (repos) => {
		set({ repos })
	},
	setAccessToken: (accessToken) => {
		set({ accessToken })
	},
	setLoading: (loading) => {
		set({ loading })
	},
	clear: () => {
		set({ accessToken: '', user: null, repos: [], loading: false })
	},
}))
