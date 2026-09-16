import { useFilesStore } from '@renderer/stores/files/files.store'
import { useSessionsStore } from '@renderer/stores/sessions/sessions.store'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { toast } from 'sonner'

export const SocketHandler = () => {
	const { setSessionState } = useSessionsStore(
		useShallow((state) => ({ setSessionState: state.setSessionState }))
	)
	const addTransfer = useFilesStore((state) => state.addTransfer)
	const setTransferStatus = useFilesStore((state) => state.setTransferStatus)

	useEffect(() => {
		const unsubscribe = window.electron.socket.onNotification((notification) => {
			toast.info(notification.title, { description: notification.description })
		})

		return () => {
			unsubscribe()
		}
	}, [])

	useEffect(() => {
		const unsubscribe = window.electron.socket.onSessionNotification((notification) => {
			toast.info(notification.title, { description: notification.description })
		})

		return () => {
			unsubscribe()
		}
	}, [])

	useEffect(() => {
		return window.electron.socket.onSessionError((error) => {
			toast.error('Session error', { description: error.message })
		})
	}, [])

	useEffect(() => {
		const unsubscribe = window.electron.socket.onStatus((status) => {
			const previous = useSessionsStore.getState().sessions.get(status.repoId)
			setSessionState(status.repoId, status.status)
			if (previous && previous.state !== 'connected' && status.status === 'connected') {
				toast.success('Session connected')
			}
		})

		return () => {
			unsubscribe()
		}
	}, [setSessionState])

	useEffect(() => {
		return window.electron.socket.onFilesPublished((payload) => {
			const session = useSessionsStore.getState().sessions.get(payload.repoId)
			if (!session) return

			useSessionsStore.getState().setSessionFiles(
				payload.repoId,
				payload.files.map((file) => ({
					...file,
					id: `${payload.senderId}:${file.id}`,
					sourceId: payload.senderId,
					sourceName: payload.senderName,
					sourceFileId: file.id,
				}))
			)
		})
	}, [])

	useEffect(() => {
		return window.electron.socket.onFilesRemoved(({ repoId, senderId, filesIds }) => {
			const store = useSessionsStore.getState()
			const session = store.sessions.get(repoId)
			if (!session) return
			store.removeSessionFiles(
				repoId,
				session.files.filter(
					(file) =>
						file.sourceId === senderId && (!filesIds || filesIds.includes(file.sourceFileId ?? ''))
				)
			)
		})
	}, [])

	useEffect(() => {
		return window.electron.socket.onCatalogRequested(({ repoId }) => {
			const session = useSessionsStore.getState().sessions.get(repoId)
			if (session?.role !== 'owner') return
			const files =
				session?.files
					.filter((file) => !file.sourceId)
					.map(({ id, name, relativePath, hash, size }) => ({
						id,
						name,
						relativePath,
						hash,
						size,
					})) ?? []
			if (files.length) {
				window.electron.socket.shareFiles({ repoId: repoId.toString(), files }).catch((error) =>
					toast.error('Could not refresh the shared file catalog', {
						description: String(error),
					})
				)
			}
		})
	}, [])

	useEffect(() => {
		return window.electron.socket.onCatalogRefreshing(({ repoId }) => {
			const store = useSessionsStore.getState()
			const session = store.sessions.get(repoId)
			if (!session) return
			store.removeSessionFiles(
				repoId,
				session.files.filter((file) => Boolean(file.sourceId))
			)
		})
	}, [])

	useEffect(() => {
		return window.electron.socket.onLocalFileChanged(({ repoId, file }) => {
			useSessionsStore.getState().setSessionFiles(repoId, [file])
		})
	}, [])

	useEffect(() => {
		return window.electron.socket.onLocalFilesRemoved(({ repoId, filesIds }) => {
			const store = useSessionsStore.getState()
			const session = store.sessions.get(repoId)
			if (!session) return
			store.removeSessionFiles(
				repoId,
				session.files.filter((file) => !file.sourceId && filesIds.includes(file.id))
			)
		})
	}, [])

	useEffect(() => {
		const unsubscribe = window.electron.socket.onPeerRequestedData((data) => {
			window.electron.socket
				.createTunnel(data)
				.catch((error) => toast.error('Could not create transfer', { description: String(error) }))
		})

		return () => {
			unsubscribe()
		}
	}, [])

	useEffect(() => {
		return window.electron.socket.onFilesDelivery(async (delivery) => {
			const { batchId, repoId, senderId, senderName, filesIds } = delivery
			const session = useSessionsStore.getState().sessions.get(repoId)
			const receivedFiles =
				session?.files.filter(
					(file) => file.sourceId === senderId && filesIds.includes(file.sourceFileId ?? '')
				) ?? []
			addTransfer(repoId, batchId, receivedFiles, 'receiving', {
				id: senderId,
				name: senderName,
			})
			try {
				await window.electron.be.receiveFiles({
					batchId,
					repoId,
					requestedFileIds: filesIds,
					expectedFiles: receivedFiles.map(({ sourceFileId, relativePath, hash, size }) => ({
						id: sourceFileId!,
						relativePath,
						hash,
						size,
					})),
				})
				setTransferStatus(repoId, batchId, 'received')
				toast.success('Files received')
			} catch (error) {
				setTransferStatus(repoId, batchId, 'failed')
				toast.error('Could not receive files', { description: String(error) })
			}
		})
	}, [addTransfer, setTransferStatus])

	useEffect(() => {
		const unsubscribe = window.electron.socket.onFilesToSend((transfer) => {
			const session = useSessionsStore.getState().sessions.get(transfer.repoId)
			const files =
				session?.files.filter((file) => !file.sourceId && transfer.filesIds.includes(file.id)) ?? []
			if (!files.length) return
			addTransfer(transfer.repoId, transfer.batchId, files, 'synchronizing', {
				id: transfer.receiverId,
				name: transfer.receiverName,
			})

			window.electron.be
				.sendFiles({
					batchId: transfer.batchId,
					filePaths: files.map((file) => file.relativePath),
					repoId: transfer.repoId,
				})
				.then(() => setTransferStatus(transfer.repoId, transfer.batchId, 'sent'))
				.catch((error) => {
					setTransferStatus(transfer.repoId, transfer.batchId, 'failed')
					toast.error('Could not send files', { description: String(error) })
				})
		})

		return () => {
			unsubscribe()
		}
	}, [addTransfer, setTransferStatus])

	return null
}
