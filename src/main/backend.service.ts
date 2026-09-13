import keytar from 'keytar'
import { api } from './axios/client'
import { setClientToken } from './axios/interceptors'
import { ErrorCodes } from './axios/errorCodes'
import fs from 'node:fs'
import { PassThrough } from 'node:stream'
import { ZipArchive } from 'archiver'
import path from 'node:path'
import unzipper from 'unzipper'
import axios from 'axios'

const requestError = (error: unknown) => {
	if (axios.isAxiosError(error)) {
		if (!error.response) {
			return {
				message: 'Could not connect to the server. Check your connection and try again.',
				code: 'CONNECTION_ERROR',
			}
		}
		return {
			message: error.response.data?.message ?? 'The server could not complete the request.',
			code: error.response.data?.code ?? 'SERVER_ERROR',
		}
	}
	return { message: 'An unexpected error occurred. Please try again.', code: 'UNKNOWN_ERROR' }
}

const failure = (error: unknown) => ({ success: false as const, error: requestError(error) })
const responseFailure = (data: { message?: string; code?: string }) => ({
	success: false as const,
	error: {
		message: data?.message ?? 'The server could not complete the request.',
		code: data?.code ?? 'SERVER_ERROR',
	},
})

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
		try {
			const response = await api.post('/auth/login', { code, code_verifier: codeVerifier })

			if (response.status !== 201) {
				setClientToken('')
				await this.clearRefreshAccessToken()

				return responseFailure(response.data)
			}

			await this.saveRefreshAccessToken(response.data.refreshToken)
			setClientToken(response.data.accessToken)

			return {
				success: true,
				data: {
					accessToken: response.data.accessToken,
					user: response.data.user,
				},
			}
		} catch (error) {
			return failure(error)
		}
	}

	public async logout() {
		try {
			const response = await api.post('/auth/logout')
			console.log(response)
			if (response.status < 200 || response.status >= 300) {
				return responseFailure(response.data)
			}
			return { success: true as const }
		} catch (error) {
			return failure(error)
		} finally {
			setClientToken('')
			await this.clearRefreshAccessToken()
		}
	}

	public async refresh() {
		const refreshToken = await this.getRefreshAccessToken()

		if (!refreshToken) {
			return {
				success: false,
				error: {
					message: '',
					code: '',
				},
			}
		}

		try {
			const response = await api.post('/auth/refresh', { refreshToken })

			if (response.status !== 201) {
				if (ErrorCodes.SESSION_REVOKED === response.data.code) {
					setClientToken('')
					await this.clearRefreshAccessToken()
				}
				return responseFailure(response.data)
			}

			if (response.data.accessToken) {
				setClientToken(response.data.accessToken)
			}

			return {
				success: true,
				data: response.data,
			}
		} catch (error) {
			return failure(error)
		}
	}

	public async getUser() {
		try {
			const response = await api.get('/github/me')

			if (response.status !== 200) {
				return responseFailure(response.data)
			}

			return {
				success: true,
				data: response.data,
			}
		} catch (error) {
			return failure(error)
		}
	}

	public async getRepos(params: Params = {}) {
		try {
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
				return responseFailure(response.data)
			}

			return {
				success: true,
				data: response.data,
			}
		} catch (error) {
			return failure(error)
		}
	}

	public async sendFiles({ batchId, filePaths }: SendFiles): Promise<{
		success: boolean
	}> {
		const streamBridge = new PassThrough()
		const archive = new ZipArchive({ zlib: { level: 5 } })

		archive.pipe(streamBridge)

		const request = api.post(`/stream-bridge/${batchId}/transmitter`, streamBridge, {
			headers: {
				'Content-Type': 'application/zip',
			},
		})

		for (const filePath of filePaths) {
			if (!fs.existsSync(filePath)) continue

			archive.file(filePath, {
				name: path.basename(filePath),
			})
		}

		await archive.finalize()

		await request
		return { success: true }
	}

	public async receiveFiles({ batchId, repositoryPath }: ReceiveFiles): Promise<{
		success: boolean
	}> {
		const response = await api.get(`/stream-bridge/${batchId}/receiver`, {
			responseType: 'stream',
		})

		const extract = unzipper.Extract({
			path: repositoryPath,
		})

		return new Promise((resolve, reject) => {
			response.data
				.pipe(extract)
				.on('close', () => {
					resolve({ success: true })
				})
				.on('error', reject)

			response.data.on('error', reject)
		})
	}
}

interface SendFiles {
	filePaths: string[]
	batchId: string
}

interface ReceiveFiles {
	repositoryPath: string
	batchId: string
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
