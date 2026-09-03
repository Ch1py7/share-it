import { io, Socket } from 'socket.io-client'
import type { BrowserWindow } from 'electron'
import { ClientToServerEvents, ServerToClientEvents } from './socket.types'

export class SocketService {
	private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
	private readonly window: BrowserWindow

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
	}

	public disconnect() {
		this.socket?.disconnect()
		this.socket = null
	}

	public connectSession({ repositoryName, repoId, username, userId }) {
		if (!this.socket) {
			this.connect()
		}

		this.socket?.emit('session:connect', { repositoryName, repoId, username, userId })
	}

	public disconnectSession({ repositoryName, repoId, username }) {
		this.socket?.emit('session:disconnect', { repositoryName, repoId, username })
	}
}
