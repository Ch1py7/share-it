import { createHash } from 'node:crypto'
import fs from 'node:fs'
import { copyFile, lstat, mkdir, mkdtemp, realpath, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { type Readable, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import unzipper from 'unzipper'
import { isWithinDirectory } from '../security'

const maxReceivedFiles = 100
const maxReceivedFileSize = 100 * 1024 * 1024
const maxReceivedBatchSize = 200 * 1024 * 1024
const windowsAbsolutePath = /^[A-Za-z]:\//
const sha256Hash = /^[a-f0-9]{64}$/i

interface ExpectedFile {
	id: string
	relativePath: string
	hash: string
	size: number
}

const canonicalArchivePath = (value: unknown) => {
	if (typeof value !== 'string' || value.includes('\0')) throw new Error('Invalid file path')
	const normalized = value.replace(/\\/g, '/')
	if (
		!normalized ||
		normalized.startsWith('/') ||
		windowsAbsolutePath.test(normalized) ||
		normalized.split('/').some((part) => part === '' || part === '.' || part === '..')
	) {
		throw new Error('Invalid file path')
	}
	return normalized
}

const validateManifest = (requestedFileIds: unknown, value: unknown) => {
	if (!Array.isArray(value) || value.length === 0 || value.length > maxReceivedFiles) {
		throw new Error('Invalid expected file manifest')
	}

	const files = new Map<string, ExpectedFile>()
	let totalSize = 0
	for (const candidate of value) {
		if (!candidate || typeof candidate !== 'object') throw new Error('Invalid expected file')
		const file = candidate as Partial<ExpectedFile>
		const relativePath = canonicalArchivePath(file.relativePath)
		if (
			typeof file.id !== 'string' ||
			!file.id ||
			typeof file.hash !== 'string' ||
			!sha256Hash.test(file.hash) ||
			typeof file.size !== 'number' ||
			!Number.isSafeInteger(file.size) ||
			file.size < 0 ||
			file.size > maxReceivedFileSize ||
			files.has(relativePath)
		) {
			throw new Error('Invalid expected file manifest')
		}
		totalSize += file.size
		if (totalSize > maxReceivedBatchSize) throw new Error('Received batch is too large')
		files.set(relativePath, { ...file, relativePath } as ExpectedFile)
	}

	const expectedIds = new Set([...files.values()].map((file) => file.id))
	if (
		!Array.isArray(requestedFileIds) ||
		requestedFileIds.length !== files.size ||
		new Set(requestedFileIds).size !== files.size ||
		requestedFileIds.some((id) => typeof id !== 'string' || !expectedIds.has(id))
	) {
		throw new Error('Requested file IDs do not match the expected manifest')
	}

	return files
}

const safeDestination = async (root: string, relativePath: string) => {
	const destination = path.resolve(root, ...relativePath.split('/'))
	if (!isWithinDirectory(root, destination)) throw new Error('File path escapes the repository')

	let current = root
	for (const part of relativePath.split('/').slice(0, -1)) {
		current = path.join(current, part)
		try {
			if ((await lstat(current)).isSymbolicLink()) {
				throw new Error('File path contains a symbolic link')
			}
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === 'ENOENT') break
			throw error
		}
	}

	await mkdir(path.dirname(destination), { recursive: true })
	const realParent = await realpath(path.dirname(destination))
	if (!isWithinDirectory(root, realParent)) throw new Error('File path escapes the repository')
	try {
		if ((await lstat(destination)).isSymbolicLink()) {
			throw new Error('Refusing to replace a symbolic link')
		}
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
	}
	return destination
}

export const extractVerifiedArchive = async ({
	stream,
	repositoryPath,
	requestedFileIds,
	expectedFiles,
}: ExtractVerifiedArchive) => {
	const expected = validateManifest(requestedFileIds, expectedFiles)
	const stagingDirectory = await mkdtemp(path.join(tmpdir(), 'share-it-receive-'))
	const received = new Map<string, string>()

	try {
		const archive = stream.pipe(unzipper.Parse({ forceStream: true }))
		let index = 0
		for await (const entry of archive) {
			const relativePath = canonicalArchivePath(entry.path)
			const expectedFile = expected.get(relativePath)
			if (entry.type !== 'File' || !expectedFile || received.has(relativePath)) {
				entry.autodrain()
				throw new Error(`ZIP contains an unexpected entry: ${relativePath}`)
			}

			const stagedPath = path.join(stagingDirectory, `${index++}.file`)
			const hash = createHash('sha256')
			let size = 0
			const verifier = new Transform({
				transform(chunk: Buffer, _, callback) {
					size += chunk.length
					if (size > expectedFile.size || size > maxReceivedFileSize) {
						callback(new Error(`Received file is larger than expected: ${relativePath}`))
						return
					}
					hash.update(chunk)
					callback(null, chunk)
				},
			})

			await pipeline(entry, verifier, fs.createWriteStream(stagedPath, { flags: 'wx' }))
			if (size !== expectedFile.size || hash.digest('hex') !== expectedFile.hash.toLowerCase()) {
				throw new Error(`Received file does not match its manifest: ${relativePath}`)
			}
			received.set(relativePath, stagedPath)
		}

		if (received.size !== expected.size) {
			throw new Error('ZIP does not contain every requested file')
		}

		const destinations = new Map<string, string>()
		for (const relativePath of received.keys()) {
			destinations.set(relativePath, await safeDestination(repositoryPath, relativePath))
		}
		for (const [relativePath, stagedPath] of received) {
			await copyFile(stagedPath, destinations.get(relativePath)!)
		}
	} finally {
		stream.destroy()
		await rm(stagingDirectory, { recursive: true, force: true })
	}
}

interface ExtractVerifiedArchive {
	stream: Readable
	repositoryPath: string
	requestedFileIds: unknown
	expectedFiles: unknown
}
