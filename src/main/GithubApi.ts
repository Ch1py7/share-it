import keytar from 'keytar'

export class GithubApi {
	private async getToken() {
		return await keytar.getPassword('share-it', 'github-token')
	}

	public async saveToken(accessToken: string) {
		await keytar.setPassword('share-it', 'github-token', accessToken)
	}

	public async getUser() {
		const token = await this.getToken()
		if (!token) throw new Error('No GitHub token found')

		const response = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github+json',
			},
		})

		if (!response.ok) {
			throw new Error(`GitHub API error: ${response.status}`)
		}

		return await response.json()
	}

	public async getRepos(params?: any) {
		const token = await this.getToken()

		if (!token) {
			throw new Error('No GitHub token found')
		}

		const url = new URL('https://api.github.com/user/repos')

		url.searchParams.set('type', params?.type ?? '')
		url.searchParams.set('sort', params?.sort ?? '')
		url.searchParams.set('direction', params?.direction ?? '')
		url.searchParams.set('per_page', params?.per_page ?? '')
		url.searchParams.set('page', params?.page ?? '')
		url.searchParams.set('since', params?.since ?? '')
		url.searchParams.set('before', params?.before ?? '')

		const response = await fetch(url.toString(), {
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github+json',
			},
		})

		if (!response.ok) {
			throw new Error(`GitHub API error: ${response.status}`)
		}

		return await response.json()
	}
	public async logout() {
		await keytar.deletePassword('share-it', 'github-token')
	}
}
