import { resolve } from 'node:path'
import { defineConfig, loadEnv } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd())

	return {
		main: {
			define: {
				'process.env.GITHUB_CLIENT_ID': JSON.stringify(env.MAIN_VITE_GITHUB_CLIENT_ID),
				'process.env.GITHUB_SECRET': JSON.stringify(env.MAIN_VITE_GITHUB_SECRET),
			},
		},
		preload: {},
		renderer: {
			resolve: {
				alias: {
					'@renderer': resolve('src/renderer/src'),
				},
			},
			plugins: [react(), tailwindcss()],
		},
	}
})
