import keytar from 'keytar'
import { api } from './axios/client'
import { setClientToken } from './axios/interceptors'
import { ErrorCodes } from './axios/errorCodes'

export class BackendService {
	private async getRefreshAccessToken() {
		return await keytar.getPassword('share-it', 'accessToken')
	}

	private async saveRefreshAccessToken(accessToken: string) {
		await keytar.setPassword('share-it', 'accessToken', accessToken)
	}

	private async clearRefreshAccessToken() {
		await keytar.deletePassword('share-it', 'accessToken')
	}

	public async auth({ code, codeVerifier }: { code: string; codeVerifier: string }) {
		const response = await api.post('/auth/login', { code, code_verifier: codeVerifier })

		if (response.status !== 201) {
			setClientToken('')
			await this.clearRefreshAccessToken()

			return {
				success: false,
				error: {
					message: response.data.message,
					code: response.data.code,
				},
			}
		}

		await this.saveRefreshAccessToken(response.data.refreshToken)

		return {
			success: true,
			data: {
				accessToken: response.data.accessToken,
				user: response.data.user,
			},
		}
	}

	public async logout() {
		await api.post('/auth/logout')

		await this.clearRefreshAccessToken()
	}

	public async refresh() {
		const refreshToken = await this.getRefreshAccessToken()

		if (!refreshToken) {
			throw new Error('No refresh token found')
		}

		const response = await api.post('/auth/refresh', { refreshToken })

		if (response.status !== 201) {
			if (ErrorCodes.SESSION_REVOKED === response.data.code) {
				setClientToken('')
				await this.clearRefreshAccessToken()
			}
			return {
				success: false,
				error: {
					message: response.data.message,
					code: response.data.code,
				},
			}
		}

		if (response.data.accessToken) {
			setClientToken(response.data.accessToken)
		}

		return {
			success: true,
			data: response.data,
		}
	}

	public async getUser() {
		const response = await api.get('/github/me')

		if (response.status !== 200) {
			return {
				success: false,
				error: {
					message: response.data.message,
					code: response.data.code,
				},
			}
		}

		return {
			success: true,
			data: response.data,
		}
	}

	public async getRepos(params: Params) {
		const response = await api.get('/github/repos', {
			params: {
				type: params?.type ?? '',
				sort: params?.sort ?? '',
				direction: params?.direction ?? '',
				per_page: params?.per_page ?? '',
				page: params?.page ?? '',
				since: params?.since ?? '',
				before: params?.before ?? '',
			},
		})

		if (response.status !== 200) {
			return {
				success: false,
				error: {
					message: response.data.message,
					code: response.data.code,
				},
			}
		}

		return {
			success: true,
			data: response.data,
		}
	}
}

interface Params {
	// visibility: 'all' | 'public' | 'private'
	// affiliation: ('owner' | 'collaborator' | 'organization' | 'organization_member')[]
	type?: 'all' | 'public' | 'private' | 'forks' | 'sources' | 'member'
	sort?: 'created' | 'updated' | 'pushed' | 'full_name'
	direction?: 'asc' | 'desc'
	per_page?: string
	page?: string
	since?: string // ISO 8601
	before?: string // ISO 8601
}
