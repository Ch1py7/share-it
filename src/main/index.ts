import { app, shell, BrowserWindow, ipcMain, dialog, type IpcMainInvokeEvent } from 'electron'
import path, { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { BackendService } from './backend.service'
import { access, readFile, realpath } from 'node:fs/promises'
import { watch, type FSWatcher } from 'node:fs'
import { simpleGit } from 'simple-git'
import { createHash } from 'node:crypto'
import { createConnection, createServer } from 'node:net'
import { SocketService } from './services/socket.service'
import { AuthorizedRepositories, isBatchId, isGithubLoginUrl, isWithinDirectory } from './security'

let mainWindow: BrowserWindow | null = null
let socketService: SocketService | null = null
let rendererUrl: string | null = null
const authorizedRepositories = new AuthorizedRepositories()

interface WatchedRepository {
	root: string
	watcher: FSWatcher
	files: Map<string, { id: string; path: string }>
	timers: Map<string, NodeJS.Timeout>
	suppressChanges: boolean
}

const watchedRepositories = new Map<number, WatchedRepository>()
const fileKey = (filePath: string) =>
	process.platform === 'win32' ? path.normalize(filePath).toLowerCase() : path.normalize(filePath)

const sharedFileMetadata = async (root: string, filePath: string, id: string) => {
	const buffer = await readFile(filePath)
	return {
		id,
		name: path.basename(filePath),
		relativePath: path.relative(root, filePath),
		content: buffer.toString('base64'),
		hash: createHash('sha256').update(buffer).digest('hex'),
		size: buffer.length,
	}
}

const stopWatchingRepositories = () => {
	for (const repository of watchedRepositories.values()) {
		repository.watcher.close()
		for (const timer of repository.timers.values()) clearTimeout(timer)
	}
	watchedRepositories.clear()
}

const watchRepository = (repoId: number, root: string) => {
	const current = watchedRepositories.get(repoId)
	if (current?.root === root) return current
	current?.watcher.close()

	const repository: WatchedRepository = {
		root,
		files: new Map(),
		timers: new Map(),
		suppressChanges: false,
		watcher: watch(root, { recursive: true, persistent: false }, (_, filename) => {
			if (repository.suppressChanges) return
			if (!filename) return
			const absolutePath = path.resolve(root, filename.toString())
			const key = fileKey(absolutePath)
			const trackedFile = repository.files.get(key)
			if (!trackedFile) return

			const previousTimer = repository.timers.get(key)
			if (previousTimer) clearTimeout(previousTimer)
			repository.timers.set(
				key,
				setTimeout(async () => {
					repository.timers.delete(key)
					try {
						const file = await sharedFileMetadata(root, trackedFile.path, trackedFile.id)
						mainWindow?.webContents.send('session:local-file-changed', { repoId, file })
						socketService?.shareFiles({ repoId: repoId.toString(), files: [file] })
					} catch {
						repository.files.delete(key)
						mainWindow?.webContents.send('session:local-files-removed', {
							repoId,
							filesIds: [trackedFile.id],
						})
						socketService?.removeFiles({
							repoId: repoId.toString(),
							filesIds: [trackedFile.id],
						})
					}
				}, 150)
			)
		}),
	}

	watchedRepositories.set(repoId, repository)
	return repository
}

const devProfile =
	!app.isPackaged && /^[a-z0-9_-]+$/i.test(process.env.SHARE_IT_DEV_PROFILE ?? '')
		? process.env.SHARE_IT_DEV_PROFILE
		: undefined
if (devProfile) {
	app.setPath('userData', join(app.getPath('appData'), `share-it-dev-${devProfile}`))
}

const oauthPipe = (profile: 'primary' | 'peer') =>
	`\\\\.\\pipe\\share-it-oauth-${createHash('sha256').update(process.cwd()).digest('hex').slice(0, 12)}-${profile}`

const deliverOAuthCallback = (url: string) => {
	if (!url.startsWith('myapp://')) return
	mainWindow?.webContents.send('be:callback', url)

	if (!app.isPackaged) {
		const otherProfile = devProfile === 'peer' ? 'primary' : 'peer'
		const connection = createConnection(oauthPipe(otherProfile), () => connection.end(url))
	}
}

const requireTrustedSender = (event: IpcMainInvokeEvent) => {
	if (
		!mainWindow ||
		event.sender !== mainWindow.webContents ||
		event.senderFrame !== mainWindow.webContents.mainFrame ||
		event.senderFrame.url !== `${rendererUrl}/`
	) {
		throw new Error('Untrusted IPC sender')
	}
}

const handleTrusted = <TArgs extends unknown[]>(
	channel: string,
	handler: (event: IpcMainInvokeEvent, ...args: TArgs) => unknown
) => {
	ipcMain.handle(channel, (event, ...args) => {
		requireTrustedSender(event)
		return handler(event, ...(args as TArgs))
	})
}

const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
	app.quit()
}

app.on('second-instance', (_, commandLine) => {
	const url = commandLine.find((arg) => arg.startsWith('myapp://'))
	if (url) deliverOAuthCallback(url)
})

function createWindow(): void {
	mainWindow = new BrowserWindow({
		width: 900,
		height: 670,
		show: false,
		autoHideMenuBar: true,
		...(process.platform === 'linux' ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, '../preload/index.js'),
			contextIsolation: true,
			sandbox: true,
		},
	})

	socketService = new SocketService(mainWindow)

	mainWindow.on('ready-to-show', () => {
		mainWindow?.show()
	})

	mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
	mainWindow.webContents.on('will-navigate', (event) => event.preventDefault())

	if (is.dev && process.env.ELECTRON_RENDERER_URL) {
		rendererUrl = process.env.ELECTRON_RENDERER_URL
		mainWindow.loadURL(rendererUrl)
	} else {
		const rendererPath = join(__dirname, '../renderer/index.html')
		rendererUrl = pathToFileURL(rendererPath).toString()
		mainWindow.loadFile(rendererPath)
	}
}

handleTrusted('be:open-login', (_, url: unknown) => {
	if (!isGithubLoginUrl(url)) throw new Error('Invalid login URL')
	return shell.openExternal(url)
})

const backend = new BackendService()

handleTrusted(
	'be:auth',
	async (_, { code, codeVerifier }) => await backend.auth({ code, codeVerifier })
)

handleTrusted('be:refresh-token', async () => await backend.refresh())
handleTrusted('be:get-user', async () => await backend.getUser())
handleTrusted('be:get-repos', (_, { params }) => backend.getRepos(params))
handleTrusted('be:logout', async () => {
	try {
		return await backend.logout()
	} finally {
		stopWatchingRepositories()
		authorizedRepositories.clear()
	}
})

handleTrusted('be:send-files', async (_, { params }) => {
	if (!params || !isBatchId(params.batchId)) throw new Error('Invalid batch')
	const repositoryPath = authorizedRepositories.requireRoot(params.repoId)
	const filePaths = await authorizedRepositories.requireSelectedFiles(
		params.repoId,
		params.filePaths
	)
	return backend.sendFiles({ batchId: params.batchId, filePaths, repositoryPath })
})
handleTrusted('be:receive-files', async (_, { params }) => {
	if (!params || !isBatchId(params.batchId)) throw new Error('Invalid batch')
	const repositoryPath = authorizedRepositories.requireRoot(params.repoId)
	const watchedRepository = watchedRepositories.get(params.repoId)
	if (watchedRepository) {
		watchedRepository.suppressChanges = true
		for (const timer of watchedRepository.timers.values()) clearTimeout(timer)
		watchedRepository.timers.clear()
	}
	try {
		return await backend.receiveFiles({ batchId: params.batchId, repositoryPath })
	} finally {
		setTimeout(() => {
			if (watchedRepository) watchedRepository.suppressChanges = false
		}, 300)
	}
})

handleTrusted('socket:connect', () => socketService?.connect())
handleTrusted('socket:disconnect', () => socketService?.disconnect())
handleTrusted('session:connect', (_, { params }) => socketService?.connectSession(params))
handleTrusted('session:disconnect', (_, { params }) => socketService?.disconnectSession(params))
handleTrusted('session:share-files', (_, { params }) => socketService?.shareFiles(params))
handleTrusted('session:remove-files', (_, { params }) => {
	const repository = watchedRepositories.get(Number(params.repoId))
	if (repository) {
		const removedIds = new Set(params.filesIds)
		for (const [key, file] of repository.files) {
			if (removedIds.has(file.id)) repository.files.delete(key)
		}
	}
	return socketService?.removeFiles(params)
})
handleTrusted('session:request-catalog', (_, { params }) => socketService?.requestCatalog(params))
handleTrusted('session:sync-files', (_, { params }) => socketService?.syncFiles(params))
handleTrusted('session:create-tunnel', (_, { params }) => socketService?.createTunnel(params))

handleTrusted('select-folder', async (_, repoId: number) => {
	if (!Number.isSafeInteger(repoId) || repoId <= 0) throw new Error('Invalid repository ID')
	const result = await dialog.showOpenDialog({
		properties: ['openDirectory'],
	})

	if (result.canceled) {
		return null
	}

	const repositoryPath = result.filePaths[0]

	try {
		const git = simpleGit(repositoryPath)
		const remotes = await git.getRemotes(true)
		const packageJsonPath = path.join(repositoryPath, 'package.json')
		const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'))
		await access(packageJsonPath)

		const root = await authorizedRepositories.register(repoId, repositoryPath)
		watchRepository(repoId, root)
		return {
			path: root,
			valid: true,
			name: packageJson.name ?? '',
			version: packageJson.version ?? '',
			shareIt: packageJson['share-it'] ?? false,
			url: remotes[0]?.refs.fetch ?? '',
		}
	} catch {
		return {
			path: repositoryPath,
			valid: false,
		}
	}
})

handleTrusted('select-files', async (_, repoId: number) => {
	const root = authorizedRepositories.requireRoot(repoId)

	const result = await dialog.showOpenDialog({
		title: 'Select files to synchronize',
		buttonLabel: 'Select',
		properties: ['openFile', 'multiSelections'],
		defaultPath: root,
	})

	if (result.canceled) {
		return []
	}

	const files = await Promise.all(
		result.filePaths.map(async (filePath) => {
			const realFilePath = await realpath(filePath)
			if (!isWithinDirectory(root, realFilePath)) {
				return {
					error: `Selected file is outside the repository: ${filePath}`,
				}
			}

			authorizedRepositories.allowFile(repoId, realFilePath)
			const repository = watchRepository(repoId, root)
			const key = fileKey(realFilePath)
			const id = repository.files.get(key)?.id ?? crypto.randomUUID()
			repository.files.set(key, { id, path: realFilePath })

			return sharedFileMetadata(root, realFilePath, id)
		})
	)

	return files
})

app.whenReady().then(() => {
	electronApp.setAppUserModelId('com.electron')
	if (is.dev) {
		if (!devProfile) app.setAsDefaultProtocolClient('myapp', process.execPath, [process.cwd()])
	} else {
		app.setAsDefaultProtocolClient('myapp')
	}

	app.on('browser-window-created', (_, window) => {
		optimizer.watchWindowShortcuts(window)
	})

	createWindow()
	if (is.dev) {
		const profile = devProfile === 'peer' ? 'peer' : 'primary'
		const server = createServer((connection) => {
			let callback = ''
			connection.setEncoding('utf8')
			connection.on('data', (chunk) => {
				callback += chunk
				if (callback.length > 8192) connection.destroy()
			})
			connection.on('end', () => {
				if (callback.length <= 8192 && callback.startsWith('myapp://')) {
					mainWindow?.webContents.send('be:callback', callback)
				}
			})
		})
		server.on('error', (error) => console.error('OAuth relay unavailable:', error))
		server.listen(oauthPipe(profile))
		app.on('before-quit', () => server.close())
	}

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('open-url', (event, url) => {
	event.preventDefault()
	deliverOAuthCallback(url)
})

app.on('before-quit', stopWatchingRepositories)
