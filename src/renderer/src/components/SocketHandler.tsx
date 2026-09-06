import { useFilesStore } from '@renderer/stores/files/files.store'
import { useSessionsStore } from '@renderer/stores/sessions/sessions.store'
import { useEffect } from 'react'

export const SocketHandler = () => {
	const setSessionState = useSessionsStore((state) => state.setSessionState)
	const addTransfer = useFilesStore((state) => state.addTransfer)

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
			addTransfer(files.repoId, files.batchId, files.filesIds)
		})

		return () => {
			unsubscribe()
		}
	}, [addTransfer])

	return null
}
