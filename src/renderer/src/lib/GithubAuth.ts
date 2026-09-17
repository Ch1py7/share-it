import { challenge, randomString } from './utils'

export class GithubAuth {
	private codeChallenge: string | null = null

	public generateVerifier() {
		return randomString()
	}

	public async generateChallenge(verifier: string) {
		this.codeChallenge = await challenge(verifier)
	}

	public async openBrowser({ state }: { state: string }) {
		if (!this.codeChallenge) {
			console.log('no code challenge')
			return
		}

		const url = new URL('https://github.com/login/oauth/authorize')

		url.searchParams.set('client_id', import.meta.env.VITE_GITHUB_CLIENT_ID)
		url.searchParams.set('redirect_uri', 'myapp://oauth')
		url.searchParams.set('scope', 'read:user repo read:org')

		url.searchParams.set('state', state)

		url.searchParams.set('code_challenge', this.codeChallenge)
		url.searchParams.set('code_challenge_method', 'S256')

		await window.electron.login(url.toString())
	}

	public waitForCallback({ url, loginState }: { url: string; loginState: string }) {
		const oauthUrl = new URL(url)

		const code = oauthUrl.searchParams.get('code')
		const returnedState = oauthUrl.searchParams.get('state')

		if (!code) {
			throw new Error('Missing OAuth code')
		}

		if (returnedState !== loginState) {
			throw new Error('Invalid OAuth state')
		}

		return code
	}
}
