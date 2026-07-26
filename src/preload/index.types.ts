import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
	interface Window {
		electron: {
			openExternal(url: string): Promise<void>
			onGithubCallback: (callback: (url: string) => void) => void
			exchangeToken: (code: string, codeVerifier: string) => Promise<any>
			github: {
				getUser: () => Promise<any>
				getRepos: (params?: ReposParams) => Promise<any>
				logout: () => Promise<any>
				saveToken: (token: string) => Promise<any>
			}
		} & ElectronAPI
	}
}

export interface ReposParams {
	// visibility: 'all' | 'public' | 'private'
	// affiliation: ('owner' | 'collaborator' | 'organization' | 'organization_member')[]
	type?: 'all' | 'public' | 'private' | 'forks' | 'sources' | 'member'
	sort?: 'created' | 'updated' | 'pushed' | 'full_name'
	direction?: 'asc' | 'desc'
	per_page?: number
	page?: number
	since?: string // ISO 8601
	before?: string // ISO 8601
}
