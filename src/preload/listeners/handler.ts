export const onSocket =
	(ipcRenderer: Electron.IpcRenderer, event: string) => (callback: (data) => void) => {
		const listener = (_: Electron.IpcRendererEvent, ...args) => {
			callback(args[0])
		}
		ipcRenderer.on(event, listener)

		return () => ipcRenderer.removeListener(event, listener)
	}
