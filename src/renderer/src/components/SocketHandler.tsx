import { useFilesStore } from '@renderer/stores/files/files.store'
import { useSessionsStore } from '@renderer/stores/sessions/sessions.store'
import { useEffect } from 'react'
import { useShallow } from 'zustand/shallow'

export const SocketHandler = () => {
	const { setSessionState, sessions } = useSessionsStore(
		useShallow((state) => ({ setSessionState: state.setSessionState, sessions: state.sessions }))
	)
	const addTransfer = useFilesStore((state) => state.addTransfer)
	const transfers = useFilesStore((state) => state.transfers)

	useEffect(() => {
		const unsubscribe = window.electron.socket.onNotification((notification) => {
			console.log(notification)
		})

		return () => {
			unsubscribe()
		}
	}, [])

	useEffect(() => {
		const unsubscribe = window.electron.socket.onSessionNotification((notification) => {
			console.log(notification)
		})

		return () => {
			unsubscribe()
		}
	}, [])

	useEffect(() => {
		const unsubscribe = window.electron.socket.onStatus((status) => {
			setSessionState(status.repoId, status.status)
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
			const filePaths =
				currentSession?.files
					.filter((f) => files.filesIds.includes(f.id))
					.map((f) => f.relativePath) ?? []
			addTransfer(files.repoId, files.batchId, filePaths)
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

			window.electron.be.sendFiles({
				batchId: file.batchId,
				filePaths: currentBatch.filePaths,
				repoId: file.repoId,
			})
		})

		return () => {
			unsubscribe()
		}
	}, [sessions, transfers])

	return null
}
