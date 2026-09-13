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
			console.log(files)
		})

		return () => {
			unsubscribe()
		}
	}, [])

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
			window.electron.socket.createTunnel(data)
		})

		return () => {
			unsubscribe()
		}
	}, [])

	useEffect(() => {
		const unsubscribe = window.electron.socket.onFilesToSend((file) => {
			const currentTransfer = transfers.get(file.repoId)
			const currentBatch = currentTransfer?.get(file.batchId)
			if (!currentBatch) return

			const filePaths = currentBatch.files.map((f) => f.relativePath)

			window.electron.be.sendFiles({
				batchId: file.batchId,
				filePaths,
				repoId: file.repoId,
			})
		})

		return () => {
			unsubscribe()
		}
	}, [sessions, transfers])

	return null
}
