import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ConnectSession, DisconnectSession, ReposParams } from './index.types'

const api = {}

if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld('electron', {
			...electronAPI,
			openExternal: (url: string) => ipcRenderer.invoke('be:open-login', url),

			onGithubCallback: (callback: (url: string) => void) => {
				ipcRenderer.on('be:callback', (_, url) => callback(url))
			},

			selectFolder: () => ipcRenderer.invoke('select-folder'),

			selectFiles: (repositoryRoot: string) => ipcRenderer.invoke('select-files', repositoryRoot),

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
				onNotification: (callback: (data) => void) => {
					const listener = (_: Electron.IpcRendererEvent, ...args) => {
						callback(args[0])
					}
					ipcRenderer.on('notification', listener)

					return () => {
						ipcRenderer.removeListener('notification', listener)
					}
				},
				onSessionNotification: (callback: (data) => void) => {
					const listener = (_: Electron.IpcRendererEvent, ...args) => {
						callback(args[0])
					}
					ipcRenderer.on('session:notification', listener)

					return () => {
						ipcRenderer.removeListener('session:notification', listener)
					}
				},
				connectSession: (params: ConnectSession) =>
					ipcRenderer.invoke('session:connect', { params }),
				disconnectSession: (params: DisconnectSession) =>
					ipcRenderer.invoke('session:disconnect', { params }),
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
			},
		})

		contextBridge.exposeInMainWorld('api', api)
	} catch (error) {
		console.error(error)
	}
} else {
	// @ts-expect-error
	window.electron = {
		...electronAPI,
		openExternal: (url: string) => ipcRenderer.invoke('be:open-login', url),
	}

	// @ts-expect-error
	window.api = api
}
