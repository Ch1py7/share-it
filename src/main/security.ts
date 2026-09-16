import { realpath } from 'node:fs/promises'
import path from 'node:path'

const validBatchId = /^[A-Za-z0-9_-]{1,256}$/

export const isWithinDirectory = (root: string, candidate: string) => {
	const relative = path.relative(root, candidate)
	return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative)
}

export const isGithubLoginUrl = (value: unknown): value is string => {
	if (typeof value !== 'string') return false
	try {
		const url = new URL(value)
		return (
			url.protocol === 'https:' &&
			url.hostname === 'github.com' &&
			url.port === '' &&
			url.username === '' &&
			url.password === '' &&
			url.pathname === '/login/oauth/authorize'
		)
	} catch {
		return false
	}
}

const allowedExternalHosts = new Set(['github.com'])

export const isAllowedExternalUrl = (value: unknown): value is string => {
	if (typeof value !== 'string') return false
	try {
		const url = new URL(value)
		return (
			url.protocol === 'https:' &&
			allowedExternalHosts.has(url.hostname) &&
			url.port === '' &&
			url.username === '' &&
			url.password === ''
		)
	} catch {
		return false
	}
}

export const isGithubCallbackUrl = (value: unknown): value is string => {
	if (typeof value !== 'string') return false
	try {
		const url = new URL(value)
		return (
			url.protocol === 'myapp:' &&
			url.hostname === 'oauth' &&
			(url.pathname === '' || url.pathname === '/') &&
			url.username === '' &&
			url.password === ''
		)
	} catch {
		return false
	}
}

export const isBatchId = (value: unknown): value is string =>
	typeof value === 'string' && validBatchId.test(value)

export class AuthorizedRepositories {
	private readonly repositories = new Map<number, { root: string; files: Set<string> }>()

	async register(repoId: number, repositoryPath: string) {
		if (!Number.isSafeInteger(repoId) || repoId <= 0) throw new Error('Invalid repository ID')
		const root = await realpath(repositoryPath)
		this.repositories.set(repoId, { root, files: new Set() })
		return root
	}

	requireRoot(repoId: unknown) {
		if (typeof repoId !== 'number' || !Number.isSafeInteger(repoId) || repoId <= 0) {
			throw new Error('Invalid repository ID')
		}
		const repository = this.repositories.get(repoId)
		if (!repository) throw new Error('Repository folder was not selected')
		return repository.root
	}

	allowFile(repoId: number, filePath: string) {
		this.repositories.get(repoId)?.files.add(filePath)
	}

	async requireSelectedFiles(repoId: number, filePaths: unknown) {
		if (!Array.isArray(filePaths) || filePaths.length === 0) {
			throw new Error('No files selected')
		}
		const repository = this.repositories.get(repoId)
		if (!repository) throw new Error('Repository folder was not selected')
		const { root, files: selected } = repository

		return Promise.all(
			filePaths.map(async (relativePath: unknown) => {
				if (typeof relativePath !== 'string' || path.isAbsolute(relativePath)) {
					throw new Error('Invalid file path')
				}
				const absolutePath = await realpath(path.resolve(root, relativePath))
				if (!isWithinDirectory(root, absolutePath) || !selected.has(absolutePath)) {
					throw new Error('File was not selected from this repository')
				}
				return absolutePath
			})
		)
	}

	clear() {
		this.repositories.clear()
	}
}
