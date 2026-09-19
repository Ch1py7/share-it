import { io, Socket } from 'socket.io-client'
import { createPublicKey, diffieHellman, generateKeyPairSync } from 'node:crypto'
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
	TransferKeyState,
} from './socket.types'
import { getClientToken } from '../axios/interceptors'
import { deriveTransferKey } from '../security/transfer-crypto'
import { signTransferKey, trustPeerIdentity } from '../security/transfer-identity'
import { verifyTransferKey } from '../security/transfer-signature'

export class SocketService {
	private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
	private readonly window: BrowserWindow
	private readonly connectedSessions = new Map<number, ConnectSession>()
	private readonly transferKeys = new Map<string, TransferKeyState>()

	private startTransferKey(batchId: string, role: 'transmitter' | 'receiver') {
		if (this.transferKeys.has(batchId)) return
		const { publicKey, privateKey } = generateKeyPairSync('x25519')
		const timer = setTimeout(
			() => {
				if (this.transferKeys.get(batchId) !== transfer) return
				transfer.reject?.(new Error('Transfer key exchange timed out'))
				this.transferKeys.delete(batchId)
			},
			4 * 60 * 1000
		)
		const transfer: TransferKeyState = { privateKey, role, timer }
		this.transferKeys.set(batchId, transfer)
		const encodedPublicKey = publicKey.export({ type: 'spki', format: 'der' }).toString('base64')
		signTransferKey(batchId, role, encodedPublicKey)
			.then((identity) => {
				if (this.transferKeys.get(batchId) !== transfer) return
				this.socket?.emit('session:transfer-key', {
					batchId,
					publicKey: encodedPublicKey,
					...identity,
				})
			})
			.catch((error) => this.failTransferKey(batchId, error as Error))
	}

	private failTransferKey(batchId: string, error: Error) {
		const transfer = this.transferKeys.get(batchId)
		if (!transfer) return
		transfer.error = error
		transfer.reject?.(error)
	}

	public async takeTransferKey(batchId: string, role: 'transmitter' | 'receiver'): Promise<Buffer> {
		const transfer = this.transferKeys.get(batchId)
		if (!transfer || transfer.role !== role)
			throw new Error('Transfer key exchange was not started')
		try {
			if (transfer.error) throw transfer.error
			if (transfer.key) return transfer.key
			return await new Promise<Buffer>((resolve, reject) => {
				transfer.resolve = resolve
				transfer.reject = reject
			})
		} finally {
			clearTimeout(transfer.timer)
			if (this.transferKeys.get(batchId) === transfer) this.transferKeys.delete(batchId)
		}
	}

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
			for (const session of this.connectedSessions.values())
				this.socket?.emit('session:connect', session)
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
			this.startTransferKey(data.batchId, 'transmitter')
			this.window.webContents.send('session:files-to-send', {
				...data,
				repoId: Number(data.repoId),
			})
		})

		this.socket.on('session:transfer-key', async (data) => {
			try {
				if (!data.fromUserId) throw new Error('Missing peer identity')
				if (data.fromRole === 'transmitter') this.startTransferKey(data.batchId, 'receiver')
				const transfer = this.transferKeys.get(data.batchId)
				if (!transfer || transfer.role === data.fromRole || transfer.key || transfer.verifying)
					return
				transfer.verifying = true
				verifyTransferKey(
					data.batchId,
					data.fromRole,
					data.publicKey,
					data.identityKey,
					data.signature
				)
				const publicKey = createPublicKey({
					key: Buffer.from(data.publicKey, 'base64'),
					format: 'der',
					type: 'spki',
				})
				if (publicKey.asymmetricKeyType !== 'x25519') throw new Error('Invalid transfer key type')
				await trustPeerIdentity(this.window, data.fromUserId, data.fromUsername, data.identityKey)
				const currentTransfer = this.transferKeys.get(data.batchId)
				if (!currentTransfer || currentTransfer !== transfer || currentTransfer.error) return
				transfer.key = deriveTransferKey(
					diffieHellman({ privateKey: transfer.privateKey, publicKey }),
					data.batchId
				)
				transfer.resolve?.(transfer.key)
			} catch (error) {
				this.failTransferKey(data.batchId, error as Error)
			}
		})

		this.socket.on('session:members', (data) => {
			this.window.webContents.send('session:members', {
				...data,
				repoId: Number(data.repoId),
			})
		})
	}

	public disconnect() {
		for (const transfer of this.transferKeys.values()) {
			clearTimeout(transfer.timer)
			transfer.reject?.(new Error('Socket disconnected during transfer key exchange'))
		}
		this.transferKeys.clear()
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
