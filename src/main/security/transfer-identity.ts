import { createHash, createPrivateKey, createPublicKey, generateKeyPairSync } from 'node:crypto'
import { app, dialog, type BrowserWindow } from 'electron'
import keytar from 'keytar'
import { signTransferKeyMessage } from './transfer-signature'

const credentialService =
	app.isPackaged || !process.env.SHARE_IT_DEV_PROFILE
		? 'share-it-transfer-identity'
		: `share-it-transfer-identity-dev-${process.env.SHARE_IT_DEV_PROFILE}`

let identityPromise: Promise<{
	privateKey: ReturnType<typeof createPrivateKey>
	publicKey: string
}> | null = null

const identity = () => {
	identityPromise ??= (async () => {
		let stored = await keytar.getPassword(credentialService, 'private-key')
		if (!stored) {
			const pair = generateKeyPairSync('ed25519')
			stored = pair.privateKey.export({ type: 'pkcs8', format: 'der' }).toString('base64')
			await keytar.setPassword(credentialService, 'private-key', stored)
		}
		const privateKey = createPrivateKey({
			key: Buffer.from(stored, 'base64'),
			format: 'der',
			type: 'pkcs8',
		})
		if (privateKey.asymmetricKeyType !== 'ed25519') throw new Error('Invalid device identity key')
		return {
			privateKey,
			publicKey: createPublicKey(privateKey)
				.export({ type: 'spki', format: 'der' })
				.toString('base64'),
		}
	})().catch((error) => {
		identityPromise = null
		throw error
	})
	return identityPromise
}

export const signTransferKey = async (batchId: string, role: string, publicKey: string) => {
	const device = await identity()
	return {
		identityKey: device.publicKey,
		signature: signTransferKeyMessage(device.privateKey, batchId, role, publicKey),
	}
}

const fingerprint = (identityKey: string) =>
	createHash('sha256')
		.update(Buffer.from(identityKey, 'base64'))
		.digest('hex')
		.slice(0, 16)
		.toUpperCase()

const peerChecks = new Map<string, Promise<void>>()

export const trustPeerIdentity = async (
	window: BrowserWindow,
	userId: string,
	username: string,
	identityKey: string
) => {
	const previous = peerChecks.get(userId) ?? Promise.resolve()
	const check = previous
		.catch(() => {})
		.then(async () => {
			const account = `peer:${userId}`
			const stored = await keytar.getPassword(credentialService, account)
			const known: string[] = stored ? (stored.startsWith('[') ? JSON.parse(stored) : [stored]) : []
			if (!Array.isArray(known) || known.some((key) => typeof key !== 'string')) {
				throw new Error('Invalid trusted device identities')
			}
			if (known.includes(identityKey)) return
			if (known.length >= 16) throw new Error('Too many trusted devices for this user')
			if (known.length) {
				const answer = await dialog.showMessageBox(window, {
					type: 'warning',
					title: 'New device identity',
					message: `${username || userId} is connecting from a device identity you have not seen before.`,
					detail: `User ID: ${userId}\nKnown: ${known.map(fingerprint).join(', ')}\nNew: ${fingerprint(identityKey)}\nOnly trust this identity if you expected the new device.`,
					buttons: ['Cancel transfer', 'Trust device'],
					defaultId: 0,
					cancelId: 0,
				})
				if (answer.response !== 1) throw new Error('The other device identity is not trusted')
			}
			await keytar.setPassword(credentialService, account, JSON.stringify([...known, identityKey]))
		})
	peerChecks.set(userId, check)
	try {
		await check
	} finally {
		if (peerChecks.get(userId) === check) peerChecks.delete(userId)
	}
}
