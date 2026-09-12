import { app, shell, BrowserWindow, ipcMain, dialog, type IpcMainInvokeEvent } from 'electron'
import path, { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { BackendService } from './backend.service'
import { access, readFile, realpath } from 'node:fs/promises'
import { simpleGit } from 'simple-git'
import { createHash } from 'node:crypto'
import { SocketService } from './services/socket.service'
import { AuthorizedRepositories, isBatchId, isGithubLoginUrl, isWithinDirectory } from './security'

let mainWindow: BrowserWindow | null = null
let socketService: SocketService | null = null
let rendererUrl: string | null = null
const authorizedRepositories = new AuthorizedRepositories()

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
	if (url && mainWindow) {
		mainWindow.webContents.send('be:callback', url)
	}
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
		authorizedRepositories.clear()
	}
})

handleTrusted('be:send-files', async (_, { params }) => {
	if (!params || !isBatchId(params.batchId)) throw new Error('Invalid batch')
	const filePaths = await authorizedRepositories.requireSelectedFiles(
		params.repoId,
		params.filePaths
	)
	return backend.sendFiles({ batchId: params.batchId, filePaths })
})
handleTrusted('be:receive-files', async (_, { params }) => {
	if (!params || !isBatchId(params.batchId)) throw new Error('Invalid batch')
	const repositoryPath = authorizedRepositories.requireRoot(params.repoId)
	return backend.receiveFiles({ batchId: params.batchId, repositoryPath })
})

handleTrusted('socket:connect', () => socketService?.connect())
handleTrusted('socket:disconnect', () => socketService?.disconnect())
handleTrusted('session:connect', (_, { params }) => socketService?.connectSession(params))
handleTrusted('session:disconnect', (_, { params }) => socketService?.disconnectSession(params))
handleTrusted('session:share-files', (_, { params }) => socketService?.shareFiles(params))
handleTrusted('session:accept-files', (_, { params }) => socketService?.acceptFiles(params))
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
			const relativePath = path.relative(root, realFilePath)

			if (!isWithinDirectory(root, realFilePath)) {
				return {
					error: `Selected file is outside the repository: ${filePath}`,
				}
			}

			const buffer = await readFile(realFilePath)
			authorizedRepositories.allowFile(repoId, realFilePath)

			return {
				id: crypto.randomUUID(),
				name: path.basename(realFilePath),
				relativePath,
				content: buffer.toString('base64'),
				hash: createHash('sha256').update(buffer).digest('hex'),
				size: buffer.length,
			}
		})
	)

	return files
})

app.whenReady().then(() => {
	electronApp.setAppUserModelId('com.electron')
	if (is.dev) {
		app.setAsDefaultProtocolClient('myapp', process.execPath, [process.cwd()])
	} else {
		app.setAsDefaultProtocolClient('myapp')
	}

	app.on('browser-window-created', (_, window) => {
		optimizer.watchWindowShortcuts(window)
	})

	createWindow()

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

	console.log('OAuth callback:', url)
})
