import { io, Socket } from 'socket.io-client'
import type { BrowserWindow } from 'electron'

export class SocketService {
	private socket: Socket | null = null
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
			console.log(data)
		})
	}

	public disconnect() {
		this.socket?.disconnect()
		this.socket = null
	}

	public connectSession({ repositoryName, roomId, username, userId }) {
		if (!this.socket) {
			this.connect()
		}

		this.socket?.emit('session:connect', { repositoryName, roomId, username, userId })
	}
}
