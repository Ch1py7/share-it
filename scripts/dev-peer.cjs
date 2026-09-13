const { spawn } = require('node:child_process')
const { existsSync } = require('node:fs')
const { join } = require('node:path')

const projectRoot = join(__dirname, '..')
if (!existsSync(join(projectRoot, 'out', 'main', 'index.js'))) {
	console.error('Start `pnpm dev` first so Electron builds the development app.')
	process.exit(1)
}

const electron = require('electron')
const child = spawn(electron, [projectRoot], {
	cwd: projectRoot,
	stdio: 'inherit',
	env: {
		...process.env,
		SHARE_IT_DEV_PROFILE: 'peer',
		ELECTRON_RENDERER_URL: process.env.ELECTRON_RENDERER_URL || 'http://localhost:5173',
	},
})

child.on('error', (error) => {
	console.error('Could not start the peer instance:', error)
	process.exitCode = 1
})
child.on('exit', (code) => {
	process.exitCode = code ?? 1
})
