import { useFilesStore } from '@renderer/stores/files/files.store'
import { useSessionsStore } from '@renderer/stores/sessions/sessions.store'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'
import { toast } from 'sonner'

export const SocketHandler = () => {
	const { setSessionState, sessions } = useSessionsStore(
		useShallow((state) => ({ setSessionState: state.setSessionState, sessions: state.sessions }))
	)
	const addTransfer = useFilesStore((state) => state.addTransfer)
	const setTransferStatus = useFilesStore((state) => state.setTransferStatus)
	const transfers = useFilesStore((state) => state.transfers)

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
		const unsubscribe = window.electron.socket.onFilesOfferReceived((files) => {
			if (files.repoId === null || !useSessionsStore.getState().sessions.has(files.repoId)) {
				toast.error('File offer received without an active repository')
				return
			}
			const repoId = files.repoId
			addTransfer(
				repoId,
				files.batchId,
				files.filenames.map((filename, index) => ({
					id: `${files.batchId}_${index}`,
					name: filename,
					relativePath: filename,
					hash: '',
					size: 0,
				})),
				'pending',
				{ id: files.senderId, name: files.senderName }
			)

			toast.info(`${files.senderName} wants to share files`, {
				description: files.filenames.join(', '),
				duration: 30000,
				action: {
					label: 'Accept',
					onClick: () => {
						window.electron.socket
							.acceptFiles({ batchId: files.batchId, senderId: files.senderId })
							.catch((error) =>
								toast.error('Could not accept files', { description: String(error) })
							)
					},
				},
			})
		})

		return () => {
			unsubscribe()
		}
	}, [addTransfer])

	useEffect(() => {
		const unsubscribe = window.electron.socket.onBatch((files) => {
			const currentSession = sessions.get(files.repoId)
			const sessionFiles = currentSession?.files.filter((f) => files.filesIds.includes(f.id)) ?? []
			addTransfer(files.repoId, files.batchId, sessionFiles, 'sent')
		})

		return () => {
			unsubscribe()
		}
	}, [addTransfer, sessions])

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
		return window.electron.socket.onFilesDelivery(async ({ batchId, repoId }) => {
			if (repoId === null) {
				toast.error('Could not identify the destination repository')
				return
			}

			try {
				console.log(batchId)
				console.log(repoId)
				await window.electron.be.receiveFiles({ batchId, repoId })
				setTransferStatus(repoId, batchId, 'received')
				toast.success('Files received')
			} catch (error) {
				toast.error('Could not receive files', { description: String(error) })
			}
		})
	}, [setTransferStatus])

	useEffect(() => {
		const unsubscribe = window.electron.socket.onFilesToSend((file) => {
			const currentTransfer = transfers.get(file.repoId)
			const currentBatch = currentTransfer?.get(file.batchId)
			if (!currentBatch) return

			const filePaths = currentBatch.files.map((f) => f.relativePath)
			console.log({
				batchId: file.batchId,
				filePaths,
				repoId: file.repoId,
			})

			window.electron.be
				.sendFiles({
					batchId: file.batchId,
					filePaths,
					repoId: file.repoId,
				})
				.catch((error) => toast.error('Could not send files', { description: String(error) }))
		})

		return () => {
			unsubscribe()
		}
	}, [sessions, transfers])

	return null
}
