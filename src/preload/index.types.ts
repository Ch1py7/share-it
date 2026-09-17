/** biome-ignore-all lint/suspicious/noExplicitAny: is not required here */

declare global {
	interface Window {
		electron: {
			login(url: string): Promise<void>
			openExternal(url: string): Promise<void>
			onGithubCallback: (callback: (url: string) => void) => void
			selectFolder: (repoId: number) => Promise<LocalFolder | null>
			selectFiles: (repoId: number) => Promise<LocalSecretFile[]>
			socket: {
				connect: () => Promise<void>
				disconnect: () => Promise<void>

				onConnection: (callback: () => void) => () => void
				onNotification: (callback: (data: OnNotification) => void) => () => void
				onSessionNotification: (callback: (data: OnNotification) => void) => () => void
				onStatus: (callback: (data: OnStatus) => void) => () => void
				onSessionError: (callback: (data: OnError) => void) => () => void
				onFilesPublished: (callback: (data: OnFilesPublished) => void) => () => void
				onFilesRemoved: (callback: (data: OnFilesRemoved) => void) => () => void
				onCatalogRequested: (callback: (data: OnCatalogRequested) => void) => () => void
				onCatalogRefreshing: (callback: (data: OnCatalogRequested) => void) => () => void
				onLocalFileChanged: (callback: (data: OnLocalFileChanged) => void) => () => void
				onLocalFilesRemoved: (callback: (data: OnLocalFilesRemoved) => void) => () => void
				onFilesDelivery: (callback: (data: OnFilesDelivery) => void) => () => void
				onFilesToSend: (callback: (data: OnFilesToSend) => void) => () => void
				onMembers: (callback: (data: OnMembers) => void) => () => void

				connectSession: (params: ConnectSession) => Promise<void>
				disconnectSession: (params: DisconnectSession) => Promise<void>

				shareFiles: (params: ShareFiles) => Promise<void>
				removeFiles: (params: RemoveFiles) => Promise<void>
				requestCatalog: (params: RequestCatalog) => Promise<void>
				syncFiles: (params: SyncFiles) => Promise<void>
				setSharingPermission: (params: SetSharingPermission) => Promise<void>
			}
			be: {
				logout: () => Promise<{ success: true } | FailureResponse>
				getRepos: (params?: ReposParams) => Promise<CommonResponse<any>>
				refresh: () => Promise<CommonResponse<RefreshResponse>>
				auth: (code: string, codeVerifier: string) => Promise<CommonResponse<AuthResponse>>
				getUser: () => Promise<CommonResponse<User>>
				sendFiles: (params: SendFiles) => Promise<{ success: boolean }>
				receiveFiles: (params: ReceiveFiles) => Promise<{ success: boolean }>
			}
		}
	}
}

interface OnFilesToSend {
	batchId: string
	repoId: number
	filesIds: string[]
	receiverId: string
	receiverName: string
}

export interface ShareFiles {
	repoId: string
	files: SharedFile[]
}

export interface SyncFiles {
	repoId: string
	senderId: string
	filesIds: string[]
}

export interface RemoveFiles {
	repoId: string
	filesIds: string[]
}

export interface RequestCatalog {
	repoId: string
}

export interface SetSharingPermission {
	repoId: string
	targetSocketId: string
	canShare: boolean
}

interface OnMembers {
	repoId: number
	members: SessionMember[]
}

interface SessionMember {
	socketId: string
	userId: string
	username: string
	role: 'owner' | 'collaborator'
	canShare: boolean
}

interface OnFilesPublished {
	repoId: number
	files: SharedFile[]
	senderId: string
	senderName: string
}

interface OnFilesRemoved {
	repoId: number
	senderId: string
	filesIds?: string[]
}

interface OnCatalogRequested {
	repoId: number
}

interface OnLocalFileChanged {
	repoId: number
	file: LocalSecretFile
}

interface OnLocalFilesRemoved {
	repoId: number
	filesIds: string[]
}

interface OnError {
	message: string
}

interface OnFilesDelivery {
	batchId: string
	repoId: number
	filesIds: string[]
	senderId: string
	senderName: string
}

interface SharedFile {
	id: string
	name: string
	relativePath: string
	hash: string
	size: number
}

export interface ConnectSession {
	repoId: string
	role: 'owner' | 'collaborator'
	repositoryName: string
}

export type DisconnectSession = Omit<ConnectSession, 'role'>

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
	error?: string
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

export interface SendFiles {
	filePaths: string[]
	batchId: string
	repoId: number
}

export interface ReceiveFiles {
	repoId: number
	batchId: string
	requestedFileIds: string[]
	expectedFiles: Array<{
		id: string
		relativePath: string
		hash: string
		size: number
	}>
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
