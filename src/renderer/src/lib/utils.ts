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
