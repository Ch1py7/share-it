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

export const formatWithCommas = (num: number) => {
	return num.toLocaleString('en-US')
}

export const mergeFiles = (current: Files[], incoming: Files[]): Files[] => {
	const files = new Map(current.map((file) => [file.relativePath, file]))

	for (const file of incoming) {
		files.set(file.relativePath, file)
	}

	return [...files.values()]
}

export const sizePrefix = (size: number) => {
	if (size > 999) {
		return 'mb'
	} else if (size > 999999) {
		return 'gb'
	} else {
		return 'kb'
	}
}
