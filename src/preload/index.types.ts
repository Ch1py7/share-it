/** biome-ignore-all lint/suspicious/noExplicitAny: is not required here */
import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
	interface Window {
		electron: {
			openExternal(url: string): Promise<void>
			onGithubCallback: (callback: (url: string) => void) => void
			selectFolder: () => Promise<LocalFolder>
			selectFiles: (repositoryRoot: string) => Promise<LocalSecretFile[]>
			socket: {
				connect: () => Promise<void>
				disconnect: () => Promise<void>
				onConnection: (callback: () => void) => () => void
				onNotification: (callback: (data: Notification) => void) => () => void
				onSessionNotification: (callback: (data: Notification) => void) => () => void
				onStatus: (callback: (data: Status) => void) => () => void
				connectSession: (params: ConnectSession) => Promise<void>
				disconnectSession: (params: DisconnectSession) => Promise<void>
			}
			be: {
				logout: () => Promise<any>
				getRepos: (params?: ReposParams) => Promise<CommonResponse<any>>
				refresh: () => Promise<CommonResponse<RefreshResponse>>
				auth: (code: string, codeVerifier: string) => Promise<CommonResponse<AuthResponse>>
				getUser: () => Promise<CommonResponse<User>>
			}
		} & ElectronAPI
	}
}

export interface ConnectSession {
	repoId: string
	username: string
	userId: number
	repositoryName: string
}

export type DisconnectSession = Omit<ConnectSession, 'userId'>

interface Notification {
	title: string
	description: string
}
interface Status {
	repoId: number
	status: States
}

export type States = 'disconnected' | 'error' | 'connected' | 'loading' | 'pending'

interface LocalSecretFile {
	name: string
	relativePath: string
	content: string
	hash: string
	size: number
}

interface LocalFolder {
	path: string
	valid: boolean
	name?: string
	version?: string
	shareIt?: boolean
	url?: string
}

interface RefreshResponse {
	accessToken: string
}

interface User {
	id: string
	createdAt: Date
	updatedAt: Date
	githubId: number
	githubUsername: string
	avatarUrl: string
}

interface AuthResponse {
	accessToken: string
	user: User
}

type CommonResponse<T> = SuccessResponse<T> | FailureResponse

interface ErrorResponse {
	message: string
	code: string
}

interface SuccessResponse<T> {
	success: true
	data: T
}

interface FailureResponse {
	success: false
	error: ErrorResponse
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
