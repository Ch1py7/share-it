import { Card } from '@renderer/components/Card'
import { GithubIcon } from '@renderer/components/icons/Github'
import { useUser } from '@renderer/context/user.context'
import { GithubAuth } from '@renderer/lib/GithubAuth'
import { useEffect, useRef, useState } from 'react'

export const Login = () => {
	const { setUser, setRepos } = useUser()
	const [isLoggingIn, setIsLoggingIn] = useState(false)
	const codeVerifier = useRef<string | null>(null)
	const loginState = useRef<string | null>(null)

	const github = new GithubAuth()

	const onClick = async () => {
		if (isLoggingIn) return

		setIsLoggingIn(true)

		const verifier = github.generateVerifier()
		codeVerifier.current = verifier

		await github.generateChallenge(verifier)

		const state = crypto.randomUUID()
		loginState.current = state

		github.openBrowser({ state: loginState.current ?? '' })
	}

	const cancelLogin = () => {
		codeVerifier.current = null
		loginState.current = null
		setIsLoggingIn(false)
	}

	useEffect(() => {
		const unsubscribe = window.electron.onGithubCallback(async (url) => {
			try {
				const code = github.waitForCallback({ url, loginState: loginState.current ?? '' })
				const token = await window.electron.exchangeToken(code, codeVerifier.current!)
				await window.electron.github.saveToken(token.access_token)
				const user = await window.electron.github.getUser()
				setUser(user)
				const repos = await window.electron.github.getRepos()
				setRepos(repos)
			} finally {
				codeVerifier.current = null
				loginState.current = null
				setIsLoggingIn(false)
			}
		})

		return unsubscribe
	}, [])

	return (
		<div className="min-h-screen w-screen bg-linear-to-br from-zinc-50 via-white to-zinc-100 flex items-center justify-center p-6">
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-zinc-300/20 blur-3xl" />
			</div>

			<div className="flex flex-col items-center gap-8">
				<div className="text-center">
					<h1 className="text-5xl font-bold tracking-tight text-zinc-900">Share-it</h1>

					<p className="mt-3 max-w-md text-zinc-600">
						Collaborative version control for teams. Sync files and keep everyone up to date.
					</p>
				</div>

				<Card className="w-105 rounded-2xl border border-zinc-200 bg-white/80 backdrop-blur-xl shadow-2xl">
					<div className="flex flex-col gap-6 p-8">
						<div className="text-center space-y-2">
							<h2 className="text-2xl font-semibold text-zinc-900">Welcome back</h2>

							<p className="text-sm text-zinc-500">Sign in with your GitHub account to continue.</p>
						</div>

						{isLoggingIn ? (
							<button type="button" onClick={cancelLogin}>
								Cancel login
							</button>
						) : (
							<button
								type="button"
								className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-zinc-900 font-medium text-white transition-all duration-200 hover:bg-black hover:shadow-lg active:scale-95 disabled:bg-gray-900"
								onClick={onClick}
								disabled={isLoggingIn}
							>
								<GithubIcon className="h-5 w-5 transition-transform group-hover:rotate-6" />
								{isLoggingIn ? 'Logging in...' : 'Sign in with GitHub'}
							</button>
						)}

						<p className="text-center text-xs text-zinc-400">
							By continuing you agree to authenticate with GitHub.
						</p>
					</div>
				</Card>
			</div>
		</div>
	)
}
