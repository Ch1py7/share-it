import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ReposParams } from './index.types'

const api = {}

if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld('electron', {
			...electronAPI,
			openExternal: (url: string) => ipcRenderer.invoke('github:open-login', url),
			exchangeToken: (code: string, codeVerifier: string) =>
				ipcRenderer.invoke('github:exchange-token', {
					code,
					codeVerifier,
				}),

			onGithubCallback: (callback: (url: string) => void) => {
				ipcRenderer.on('github:callback', (_, url) => callback(url))
			},

			github: {
				getUser: () => ipcRenderer.invoke('github:get-user'),

				getRepos: (params: ReposParams) => ipcRenderer.invoke('github:get-repos', params),

				logout: () => ipcRenderer.invoke('github:logout'),

				saveToken: (token: string) => ipcRenderer.invoke('github:save-token', { token }),
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
		openExternal: (url: string) => ipcRenderer.invoke('github:open-login', url),
	}

	// @ts-expect-error
	window.api = api
}
