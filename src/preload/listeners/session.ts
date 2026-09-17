import { onSocket } from './handler'

export const session = (ipcRenderer: Electron.IpcRenderer) => ({
	onFilesPublished: onSocket(ipcRenderer, 'session:files-published'),
	onFilesRemoved: onSocket(ipcRenderer, 'session:files-removed'),
	onCatalogRequested: onSocket(ipcRenderer, 'session:catalog-requested'),
	onCatalogRefreshing: onSocket(ipcRenderer, 'session:catalog-refreshing'),
	onLocalFileChanged: onSocket(ipcRenderer, 'session:local-file-changed'),
	onLocalFilesRemoved: onSocket(ipcRenderer, 'session:local-files-removed'),
	onFilesDelivery: onSocket(ipcRenderer, 'session:files-delivery'),
	onFilesToSend: onSocket(ipcRenderer, 'session:files-to-send'),
	onMembers: onSocket(ipcRenderer, 'session:members'),
})
