/** biome-ignore-all lint/suspicious/noExplicitAny: is not required here */
import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
	interface Window {
		electron: {
			openExternal(url: string): Promise<void>
			onGithubCallback: (callback: (url: string) => void) => void
			selectFolder: () => Promise<LocalFolder | null>
			selectFiles: (repositoryRoot: string) => Promise<LocalSecretFile[]>
			socket: {
				connect: () => Promise<void>
				disconnect: () => Promise<void>

				onConnection: (callback: () => void) => () => void
				onNotification: (callback: (data: OnNotification) => void) => () => void
				onSessionNotification: (callback: (data: OnNotification) => void) => () => void
				onStatus: (callback: (data: OnStatus) => void) => () => void
				onFilesOfferReceived: (callback: (data: OnFilesOfferReceived) => void) => () => void
				onPeerRequestedData: (callback: (data: OnPeerRequestedData) => void) => () => void
				onFilesDelivery: (callback: (data: OnFilesDelivery[]) => void) => () => void
				onError: (callback: (data: OnError) => void) => () => void
				onBatch: (callback: (data: OnBatch) => void) => () => void

				connectSession: (params: ConnectSession) => Promise<void>
				disconnectSession: (params: DisconnectSession) => Promise<void>

				shareFiles: (params: ShareFiles) => Promise<void>
				acceptFiles: (params: AcceptFiles) => Promise<void>
				deliverFilesPayload: (params: DeliverFilesPayload) => Promise<void>
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

interface OnBatch {
	repoId: number
	batchId: string
	filesIds: string[]
}

export interface ShareFiles {
	repoId: string
	files: { filename: string; id: string }[]
}

export interface AcceptFiles {
	offerId: string
	senderId: string
}

export interface DeliverFilesPayload {
	receiverId: string
	files: {
		filenames: string
		fileContent: string
	}[]
}

interface OnFilesOfferReceived {
	offerId: string
	filenames: string
	senderId: string
	senderName: string
}

interface OnPeerRequestedData {
	offerId: string
	receiverId: string
	senderName: string
}

interface OnError {
	message: string
}

interface OnFilesDelivery {
	filenames: string
	fileContent: string
}

export interface ConnectSession {
	repoId: string
	username: string
	userId: number
	repositoryName: string
}

export type DisconnectSession = Omit<ConnectSession, 'userId'>

interface OnNotification {
	title: string
	description: string
}
interface OnStatus {
	repoId: number
	status: States
}

export type States = 'disconnected' | 'error' | 'connected' | 'loading' | 'pending'

interface LocalSecretFile {
	id: string
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
