import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto'
import { Transform } from 'node:stream'

const magic = Buffer.from('SIT1')
const chunkSize = 64 * 1024 // 64kb
const tagSize = 16

const nonce = (prefix: Buffer, sequence: bigint) => {
	const value = Buffer.alloc(12)
	prefix.copy(value)
	value.writeBigUInt64BE(sequence, 4)
	return value
}

const associatedData = (batchId: string, sequence: bigint, final: boolean) =>
	Buffer.concat([
		Buffer.from(`share-it-transfer-v1:${batchId}:`),
		Buffer.from(sequence.toString()),
		Buffer.from(final ? ':final' : ':data'),
	])

export const deriveTransferKey = (secret: Buffer, batchId: string) =>
	Buffer.from(
		hkdfSync('sha256', secret, Buffer.from(batchId), Buffer.from('share-it file transfer v1'), 32)
	)

export const encryptTransfer = (key: Buffer, batchId: string) => {
	const prefix = randomBytes(4)
	let sequence = 0n
	let buffered = Buffer.alloc(0)

	const frame = (plain: Buffer, final: boolean) => {
		const cipher = createCipheriv('aes-256-gcm', key, nonce(prefix, sequence))
		cipher.setAAD(associatedData(batchId, sequence, final))
		const encrypted = Buffer.concat([cipher.update(plain), cipher.final()])
		const length = Buffer.alloc(4)
		length.writeUInt32BE(encrypted.length)
		sequence++
		return Buffer.concat([length, encrypted, cipher.getAuthTag()])
	}

	return new Transform({
		construct(callback) {
			this.push(Buffer.concat([magic, prefix]))
			callback()
		},
		transform(chunk: Buffer, _, callback) {
			try {
				buffered = Buffer.concat([buffered, chunk])
				while (buffered.length >= chunkSize) {
					const toEncrypt = buffered.subarray(0, chunkSize)
					this.push(frame(toEncrypt, false))
					buffered = buffered.subarray(chunkSize)
				}
				callback()
			} catch (error) {
				callback(error as Error)
			}
		},
		flush(callback) {
			try {
				if (buffered.length > 0) {
					this.push(frame(buffered, false))
				}
				this.push(frame(Buffer.alloc(0), true))
				callback()
			} catch (error) {
				callback(error as Error)
			}
		},
	})
}

export const decryptTransfer = (key: Buffer, batchId: string) => {
	let buffered = Buffer.alloc(0)
	let prefix: Buffer | null = null
	let sequence = 0n
	let complete = false
	return new Transform({
		transform(chunk: Buffer, _, callback) {
			try {
				if (complete) throw new Error('Trailing encrypted transfer data')
				buffered = Buffer.concat([buffered, chunk])
				if (!prefix) {
					if (buffered.length < 8) return callback()
					if (!buffered.subarray(0, 4).equals(magic))
						throw new Error('Invalid encrypted transfer header')
					prefix = buffered.subarray(4, 8)
					buffered = buffered.subarray(8)
				}
				while (buffered.length >= 4) {
					if (complete) throw new Error('Trailing encrypted transfer data')
					const length = buffered.readUInt32BE(0)
					if (length > chunkSize) throw new Error('Encrypted transfer frame is too large')
					if (buffered.length < 4 + length + tagSize) break
					const final = length === 0
					const decipher = createDecipheriv('aes-256-gcm', key, nonce(prefix, sequence))
					decipher.setAAD(associatedData(batchId, sequence, final))
					decipher.setAuthTag(buffered.subarray(4 + length, 4 + length + tagSize))
					const plain = Buffer.concat([
						decipher.update(buffered.subarray(4, 4 + length)),
						decipher.final(),
					])
					buffered = buffered.subarray(4 + length + tagSize)
					sequence++
					if (final) {
						if (buffered.length) throw new Error('Trailing encrypted transfer data')
						complete = true
					} else this.push(plain)
				}
				callback()
			} catch (error) {
				callback(error as Error)
			}
		},
		flush(callback) {
			if (!complete || buffered.length) callback(new Error('Encrypted transfer is incomplete'))
			else callback()
		},
	})
}
