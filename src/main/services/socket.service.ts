import { io, Socket } from 'socket.io-client'
import type { BrowserWindow } from 'electron'
import { ClientToServerEvents, ConnectSession, ServerToClientEvents } from './socket.types'
import {
	AcceptFiles,
	DeliverFilesPayload,
	DisconnectSession,
	ShareFiles,
} from '../../preload/index.types'

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

		this.socket.on('session:files-offer-received', (data) => {
			this.window.webContents.send('session:files-offer-received', data)
		})

		this.socket.on('session:peer-requested-data', (data) => {
			this.window.webContents.send('session:peer-requested-data', data)
		})

		this.socket.on('session:error', (data) => {
			this.window.webContents.send('session:error', data)
		})

		this.socket.on('session:files-delivery', (data) => {
			this.window.webContents.send('session:files-delivery', data)
		})

		this.socket.on('session:batch', (data) => {
			this.window.webContents.send('session:batch', { ...data, repoId: Number(data.repoId) })
		})
	}

	public disconnect() {
		this.socket?.disconnect()
		this.socket = null
	}

	public connectSession(payload: ConnectSession) {
		if (!this.socket) {
			this.connect()
		}

		this.socket?.emit('session:connect', payload)
	}

	public disconnectSession(payload: DisconnectSession) {
		this.socket?.emit('session:disconnect', payload)
	}

	public shareFiles(payload: ShareFiles) {
		this.socket?.emit('session:share-files', payload)
	}

	public acceptFiles(payload: AcceptFiles) {
		this.socket?.emit('session:accept-files', payload)
	}

	public deliverFilesPayload(payload: DeliverFilesPayload) {
		this.socket?.emit('session:deliver-files-payload', payload)
	}
}
