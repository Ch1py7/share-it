import { createContext, useContext, useEffect, useState } from 'react'
import { GithubRepo, GithubUser } from './user.types'

interface UserContextType {
	user: GithubUser | null
	repos: GithubRepo[] | null
	loading: boolean
	logout: () => Promise<void>
	setUser: React.Dispatch<React.SetStateAction<GithubUser | null>>
	setRepos: React.Dispatch<React.SetStateAction<GithubRepo[]>>
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<GithubUser | null>(null)
	const [repos, setRepos] = useState<GithubRepo[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function checkSession() {
			try {
				const user = await window.electron.github.getUser()
				const repos = await window.electron.github.getRepos()
				setUser(user)
				setRepos(repos)
			} catch {
				setUser(null)
			} finally {
				setLoading(false)
			}
		}

		checkSession()
	}, [])

	async function logout() {
		await window.electron.github.logout()
		setUser(null)
		setRepos([])
	}

	return (
		<UserContext.Provider
			value={{
				user,
				repos,
				loading,
				setUser,
				setRepos,
				logout,
			}}
		>
			{children}
		</UserContext.Provider>
	)
}

export const useUser = () => {
	const ctx = useContext(UserContext)

	if (!ctx) throw Error

	return ctx
}
