import { ErrorCodes } from '@renderer/constants/errors'
import { useUserStore } from '@renderer/stores/user/user.store'
import { useCallback, useEffect } from 'react'

export const Initializer = () => {
	const setUser = useUserStore((state) => state.setUser)
	const setRepos = useUserStore((state) => state.setRepos)
	const setLoading = useUserStore((state) => state.setLoading)
	const clear = useUserStore((state) => state.clear)
	const checkToken = useCallback(async () => {
		const refresh = await window.electron.be.refresh()
		if (!refresh.success) {
			if (refresh.error.code === ErrorCodes.SESSION_REVOKED) clear()
		}
	}, [])

	const checkUser = useCallback(async () => {
		const response = await window.electron.be.getUser()
		if (!response.success) {
			setUser(null)
			return
		}
		setUser(response.data)
	}, [])

	const checkRepos = useCallback(async () => {
		const response = await window.electron.be.getRepos()
		if (!response.success) {
			setRepos([])
			return
		}
		setRepos(response.data)
	}, [])

	useEffect(() => {
		const checkSession = async () => {
			await checkToken()
			await checkUser()
			await checkRepos()

			setLoading(false)
		}

		checkSession()
	}, [checkToken, checkUser, checkRepos])

	return null
}
