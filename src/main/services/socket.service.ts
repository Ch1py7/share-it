import { io, Socket } from 'socket.io-client'
import type { BrowserWindow } from 'electron'
import {
	ClientToServerEvents,
	ConnectSession,
	DisconnectSession,
	RemoveFiles,
	RequestCatalog,
	ServerToClientEvents,
	ShareFiles,
	SetSharingPermission,
	SyncFiles,
} from './socket.types'
import { getClientToken } from '../axios/interceptors'

export class SocketService {
	private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
	private readonly window: BrowserWindow
	private readonly connectedSessions = new Map<number, ConnectSession>()

	constructor(window: BrowserWindow) {
		this.window = window
	}

	public connect() {
		if (this.socket?.connected) {
			return
		}
		if (this.socket) {
			this.socket.connect()
			return
		}
		if (!getClientToken()) throw new Error('Sign in before connecting to a session')

		this.socket = io('http://localhost:8000', {
			autoConnect: false,
			auth: (callback) => callback({ token: getClientToken() }),
		})

		this.socket.connect()

		this.socket.on('connect', () => {
			this.window.webContents.send('socket:connection', 'connected')
			for (const session of this.connectedSessions.values()) this.socket?.emit('session:connect', session)
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

		this.socket.on('session:members', (data) => {
			this.window.webContents.send('session:members', {
				...data,
				repoId: Number(data.repoId),
			})
		})
	}

	public disconnect() {
		this.socket?.disconnect()
		this.socket = null
		this.connectedSessions.clear()
	}

	public async connectSession(payload: ConnectSession) {
		this.connect()
		const socket = this.socket
		if (!socket) throw new Error('Socket could not be created')
		if (!socket.connected) {
			await new Promise<void>((resolve, reject) => {
				const timeout = setTimeout(() => finish(new Error('Socket connection timed out')), 10000)
				const finish = (error?: Error) => {
					clearTimeout(timeout)
					socket.off('connect', onConnect)
					socket.off('connect_error', onError)
					if (error) reject(error)
					else resolve()
				}
				const onConnect = () => finish()
				const onError = (error: Error) => finish(error)
				socket.once('connect', onConnect)
				socket.once('connect_error', onError)
			})
		}
		socket.emit('session:connect', payload)
		this.connectedSessions.set(Number(payload.repoId), payload)
	}

	public disconnectSession(payload: DisconnectSession) {
		this.socket?.emit('session:disconnect', payload)
		this.connectedSessions.delete(Number(payload.repoId))
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

	public setSharingPermission(payload: SetSharingPermission) {
		this.socket?.emit('session:set-sharing-permission', payload)
	}
}
