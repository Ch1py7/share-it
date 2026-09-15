import { io, Socket } from 'socket.io-client'
import type { BrowserWindow } from 'electron'
import {
	ClientToServerEvents,
	ConnectSession,
	CreateTunnel,
	DisconnectSession,
	RemoveFiles,
	RequestCatalog,
	ServerToClientEvents,
	ShareFiles,
	SyncFiles,
} from './socket.types'

export class SocketService {
	private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
	private readonly window: BrowserWindow
	private readonly connectedRepoIds = new Set<number>()

	constructor(window: BrowserWindow) {
		this.window = window
	}

	public connect() {
		if (this.socket?.connected) {
			return
		}

		this.socket = io('http://localhost:8000', {
			autoConnect: false,
		})

		this.socket.connect()

		this.socket.on('connect', () => {
			this.window.webContents.send('socket:connection', 'connected')
		})

		this.socket.on('disconnect', (reason) => {
			console.log('Socket disconnected:', reason)
		})

		this.socket.on('connect_error', (error) => {
			console.error('Socket connection error:', error)
		})

		this.socket.on('notification', (data) => {
			this.window.webContents.send('notification', data)
		})

		this.socket.on('session:notification', (data) => {
			this.window.webContents.send('session:notification', data)
		})

		this.socket.on('status', (data) => {
			this.window.webContents.send('status', { ...data, repoId: Number(data.repoId) })
		})

		this.socket.on('session:files-published', (data) => {
			this.window.webContents.send('session:files-published', {
				...data,
				repoId: Number(data.repoId),
			})
		})

		this.socket.on('session:files-removed', (data) => {
			this.window.webContents.send('session:files-removed', {
				...data,
				repoId: Number(data.repoId),
			})
		})

		this.socket.on('session:catalog-requested', (data) => {
			this.window.webContents.send('session:catalog-requested', {
				...data,
				repoId: Number(data.repoId),
			})
		})

		this.socket.on('session:catalog-refreshing', (data) => {
			this.window.webContents.send('session:catalog-refreshing', {
				...data,
				repoId: Number(data.repoId),
			})
		})

		this.socket.on('session:peer-requested-data', (data) => {
			this.window.webContents.send('session:peer-requested-data', data)
		})

		this.socket.on('session:error', (data) => {
			this.window.webContents.send('session:error', data)
		})

		this.socket.on('session:files-delivery', (data) => {
			this.window.webContents.send('session:files-delivery', {
				...data,
				repoId: Number(data.repoId),
			})
		})

		this.socket.on('session:files-to-send', (data) => {
			this.window.webContents.send('session:files-to-send', {
				...data,
				repoId: Number(data.repoId),
			})
		})
	}

	public disconnect() {
		this.socket?.disconnect()
		this.socket = null
		this.connectedRepoIds.clear()
	}

	public connectSession(payload: ConnectSession) {
		if (!this.socket) {
			this.connect()
		}

		this.socket?.emit('session:connect', payload)
		this.connectedRepoIds.add(Number(payload.repoId))
	}

	public disconnectSession(payload: DisconnectSession) {
		this.socket?.emit('session:disconnect', payload)
		this.connectedRepoIds.delete(Number(payload.repoId))
	}

	public shareFiles(payload: ShareFiles) {
		this.socket?.emit('session:share-files', payload)
	}

	public removeFiles(payload: RemoveFiles) {
		this.socket?.emit('session:remove-files', payload)
	}

	public requestCatalog(payload: RequestCatalog) {
		this.socket?.emit('session:request-catalog', payload)
	}

	public syncFiles(payload: SyncFiles) {
		this.socket?.emit('session:sync-files', payload)
	}

	public createTunnel(payload: CreateTunnel) {
		this.socket?.emit('session:create-tunnel', payload)
	}
}
