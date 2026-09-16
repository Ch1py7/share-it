import { ErrorCodes } from '@renderer/constants/errors'
import { useUserStore } from '@renderer/stores/user/user.store'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'

export const Initializer = () => {
	const setUser = useUserStore((state) => state.setUser)
	const setLoading = useUserStore((state) => state.setLoading)
	const clear = useUserStore((state) => state.clear)
	const checkToken = useCallback(async () => {
		const refresh = await window.electron.be.refresh()
		if (!refresh.success) {
			if (refresh.error.code === ErrorCodes.SESSION_REVOKED) clear()
			else if (refresh.error.code)
				toast.error('Could not restore your session', { description: refresh.error.message })
			return false
		}
		return true
	}, [])

	const checkUser = useCallback(async () => {
		const response = await window.electron.be.getUser()
		if (!response.success) {
			setUser(null)
			toast.error('Could not load your account', { description: response.error.message })
			return
		}
		setUser(response.data)
	}, [])

	useEffect(() => {
		const checkSession = async () => {
			try {
				if (await checkToken()) {
					await checkUser()
				}
			} catch {
				toast.error('Could not initialize the app', { description: 'Please try again' })
			} finally {
				setLoading(false)
			}
		}

		checkSession()
	}, [checkToken, checkUser])

	return null
}
