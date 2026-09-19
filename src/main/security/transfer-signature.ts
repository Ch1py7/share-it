import { createPublicKey, sign, verify, type KeyObject } from 'node:crypto'

const signedMessage = (batchId: string, role: string, publicKey: string) =>
	Buffer.from(`share-it-transfer-key-v1\0${batchId}\0${role}\0${publicKey}`)

export const signTransferKeyMessage = (
	privateKey: KeyObject,
	batchId: string,
	role: string,
	publicKey: string
) => sign(null, signedMessage(batchId, role, publicKey), privateKey).toString('base64')

export const verifyTransferKey = (
	batchId: string,
	role: string,
	publicKey: string,
	identityKey: string,
	signature: string
) => {
	const key = createPublicKey({
		key: Buffer.from(identityKey, 'base64'),
		format: 'der',
		type: 'spki',
	})
	if (
		key.asymmetricKeyType !== 'ed25519' ||
		!verify(null, signedMessage(batchId, role, publicKey), key, Buffer.from(signature, 'base64'))
	) {
		throw new Error('Invalid transfer identity signature')
	}
}
