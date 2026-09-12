import { contextBridge, ipcRenderer } from 'electron'
import {
	AcceptFiles,
	ConnectSession,
	CreateTunnel,
	DisconnectSession,
	ReceiveFiles,
	ReposParams,
	SendFiles,
	ShareFiles,
} from './index.types'
import { notifications } from './listeners/notifications'
import { session } from './listeners/session'

if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld('electron', {
			openExternal: (url: string) => ipcRenderer.invoke('be:open-login', url),

			onGithubCallback: (callback: (url: string) => void) => {
				ipcRenderer.on('be:callback', (_, url) => callback(url))
			},

			selectFolder: (repoId: number) => ipcRenderer.invoke('select-folder', repoId),

			selectFiles: (repoId: number) => ipcRenderer.invoke('select-files', repoId),

			socket: {
				connect: () => ipcRenderer.invoke('socket:connect'),
				disconnect: () => ipcRenderer.invoke('socket:disconnect'),

				onConnection: (callback: () => void) => {
					const listener = (_: Electron.IpcRendererEvent) => {
						callback()
					}
					ipcRenderer.on('socket:connection', listener)

					return () => {
						ipcRenderer.removeListener('socket:connection', listener)
					}
				},
				onStatus: (callback: (data) => void) => {
					const listener = (_: Electron.IpcRendererEvent, ...args) => {
						callback(args[0])
					}
					ipcRenderer.on('status', listener)

					return () => {
						ipcRenderer.removeListener('status', listener)
					}
				},
				...notifications(ipcRenderer),
				...session(ipcRenderer),

				disconnectSession: (params: DisconnectSession) =>
					ipcRenderer.invoke('session:disconnect', { params }),
				connectSession: (params: ConnectSession) =>
					ipcRenderer.invoke('session:connect', { params }),
				shareFiles: (params: ShareFiles) => ipcRenderer.invoke('session:share-files', { params }),
				acceptFiles: (params: AcceptFiles) =>
					ipcRenderer.invoke('session:accept-files', { params }),
				createTunnel: (params: CreateTunnel) =>
					ipcRenderer.invoke('session:create-tunnel', { params }),
			},

			be: {
				auth: (code: string, codeVerifier: string) => {
					return ipcRenderer.invoke('be:auth', {
						code,
						codeVerifier,
					})
				},

				refresh: () => ipcRenderer.invoke('be:refresh-token'),
				logout: () => ipcRenderer.invoke('be:logout'),
				getUser: () => ipcRenderer.invoke('be:get-user'),
				getRepos: (params: ReposParams) => ipcRenderer.invoke('be:get-repos', { params }),
				sendFiles: (params: SendFiles) => ipcRenderer.invoke('be:send-files', { params }),
				receiveFiles: (params: ReceiveFiles) => ipcRenderer.invoke('be:receive-files', { params }),
			},
		})
	} catch (error) {
		console.error(error)
	}
} else {
	// @ts-expect-error
	window.electron = {
		openExternal: (url: string) => ipcRenderer.invoke('be:open-login', url),
	}
}
