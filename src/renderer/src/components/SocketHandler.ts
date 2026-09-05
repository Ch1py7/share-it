import { useSessionsStore } from '@renderer/stores/sessions/sessions.store'
import { useEffect } from 'react'

export const SocketHandler = () => {
	const { setSessionState } = useSessionsStore()

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
	}, [])

	useEffect(() => {
		const unsubscribe = window.electron.socket.onFilesOfferReceived((files) => {
			console.log(files)
		})

		return () => {
			unsubscribe()
		}
	}, [])

	return null
}
