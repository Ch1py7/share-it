import { onSocket } from './handler'

export const session = (ipcRenderer: Electron.IpcRenderer) => ({
	onFilesOfferReceived: onSocket(ipcRenderer, 'session:files-offer-received'),
	onPeerRequestedData: onSocket(ipcRenderer, 'session:peer-requested-data'),
	onFilesDelivery: onSocket(ipcRenderer, 'session:files-delivery'),
	onBatch: onSocket(ipcRenderer, 'session:batch'),
})
