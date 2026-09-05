import { onSocket } from './handler'

export const notifications = (ipcRenderer: Electron.IpcRenderer) => ({
	onNotification: onSocket(ipcRenderer, 'notification'),
	onSessionNotification: onSocket(ipcRenderer, 'session:notification'),
	onSessionError: onSocket(ipcRenderer, 'session:error'),
})
