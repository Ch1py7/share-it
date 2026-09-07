import { onSocket } from './handler'

export const session = (ipcRenderer: Electron.IpcRenderer) => ({
	onFilesOfferReceived: onSocket(ipcRenderer, 'session:files-offer-received'),
	onBatch: onSocket(ipcRenderer, 'session:batch'),
	onPeerRequestedData: onSocket(ipcRenderer, 'session:peer-requested-data'),
	onFilesDelivery: onSocket(ipcRenderer, 'session:files-delivery'),
	onFilesToSend: onSocket(ipcRenderer, 'session:files-to-send'),
})
