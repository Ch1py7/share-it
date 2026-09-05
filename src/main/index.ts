import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import path, { join } from 'node:path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { BackendService } from './backend.service'
import { access, readFile } from 'node:fs/promises'
import { simpleGit } from 'simple-git'
import { createHash } from 'node:crypto'
import { SocketService } from './services/socket.service'

let mainWindow: BrowserWindow | null = null
let socketService: SocketService | null = null

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
			sandbox: false,
		},
	})

	socketService = new SocketService(mainWindow)

	mainWindow.on('ready-to-show', () => {
		mainWindow?.show()
	})

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url)
		return { action: 'deny' }
	})

	if (is.dev && process.env.ELECTRON_RENDERER_URL) {
		mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
	} else {
		mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
	}
}

ipcMain.handle('be:open-login', (_, url: string) => {
	shell.openExternal(url)
})

const backend = new BackendService()

ipcMain.handle(
	'be:auth',
	async (_, { code, codeVerifier }) => await backend.auth({ code, codeVerifier })
)

ipcMain.handle('be:refresh-token', async () => await backend.refresh())
ipcMain.handle('be:get-user', async () => await backend.getUser())
ipcMain.handle('be:get-repos', (_, { params }) => backend.getRepos(params))
ipcMain.handle('be:logout', () => backend.logout())

ipcMain.handle('socket:connect', () => socketService?.connect())
ipcMain.handle('socket:disconnect', () => socketService?.disconnect())
ipcMain.handle('session:connect', (_, { params }) => socketService?.connectSession(params))
ipcMain.handle('session:disconnect', (_, { params }) => socketService?.disconnectSession(params))
ipcMain.handle('session:share-files', (_, { params }) => socketService?.shareFiles(params))
ipcMain.handle('session:accept-files', (_, { params }) => socketService?.acceptFiles(params))
ipcMain.handle('session:deliver-files-payload', (_, { params }) =>
	socketService?.deliverFilesPayload(params)
)

ipcMain.handle('select-folder', async () => {
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

		return {
			path: repositoryPath,
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

ipcMain.handle('select-files', async (_, repositoryRoot: string) => {
	const result = await dialog.showOpenDialog({
		title: 'Select files to synchronize',
		buttonLabel: 'Select',
		properties: ['openFile', 'multiSelections'],
		defaultPath: repositoryRoot,
	})

	if (result.canceled) {
		return null
	}

	const files = await Promise.all(
		result.filePaths.map(async (filePath) => {
			const buffer = await readFile(filePath)

			return {
				name: path.basename(filePath),
				relativePath: path.relative(repositoryRoot, filePath),
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
