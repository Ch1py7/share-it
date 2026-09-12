import { Files } from '@renderer/stores/sessions/sessions.types'
import clsx from 'clsx'
import { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]) => {
	return twMerge(clsx(inputs))
}

const base64url = (bytes: Uint8Array) => {
	return btoa(String.fromCharCode(...bytes))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '')
}

export const randomString = (length = 64) => {
	const bytes = crypto.getRandomValues(new Uint8Array(length))

	return base64url(bytes)
}

export const challenge = async (verifier: string) => {
	const encoder = new TextEncoder()

	const hash = await crypto.subtle.digest('SHA-256', encoder.encode(verifier))

	return base64url(new Uint8Array(hash))
}

export const mergeFiles = (current: Files[], incoming: Files[]): Files[] => {
	const files = new Map(current.map((file) => [file.relativePath, file]))

	for (const file of incoming) {
		files.set(file.relativePath, file)
	}

	return [...files.values()]
}

export const formatFileSize = (sizeInKb: number): string => {
	if (sizeInKb >= 1_000_000) {
		const gb = sizeInKb / 1_000_000
		return `${gb.toLocaleString('en-US', { maximumFractionDigits: 2 })} gb`
	}

	if (sizeInKb >= 1_000) {
		const mb = sizeInKb / 1_000
		return `${mb.toLocaleString('en-US', { maximumFractionDigits: 2 })} mb`
	}

	return `${sizeInKb.toLocaleString('en-US')} kb`
}
