import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'node:crypto'

/**
 * Symmetric AES-256-GCM cifratura applicativa.
 *
 * Usato per cifrare al riposo le credenziali API Polymarket L2 di ciascun utente
 * (`users.polymarket_api_key/secret/passphrase`). Master key da env
 * `POLYMARKET_API_ENCRYPTION_KEY` (deve essere 64 hex chars = 32 bytes oppure
 * almeno 32 caratteri ASCII; viene comunque normalizzata a 32 bytes via SHA-256).
 *
 * Formato output: `<iv_hex>:<auth_tag_hex>:<ciphertext_hex>`.
 */

const ALGO = 'aes-256-gcm' as const
const IV_BYTES = 12

function getMasterKey(): Buffer {
  const raw = process.env.POLYMARKET_API_ENCRYPTION_KEY
  if (!raw) throw new Error('POLYMARKET_API_ENCRYPTION_KEY non impostato')
  // Normalizza qualsiasi input a 32 byte deterministicamente (idempotente per
  // hex 64-char e per stringhe arbitrarie ≥ 32).
  return createHash('sha256').update(raw, 'utf8').digest()
}

export function encrypt(plaintext: string): string {
  const key = getMasterKey()
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGO, key, iv)
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${tag.toString('hex')}:${ct.toString('hex')}`
}

export function decrypt(payload: string): string {
  const [ivHex, tagHex, ctHex] = payload.split(':')
  if (!ivHex || !tagHex || !ctHex) throw new Error('Ciphertext malformato')
  const iv = Buffer.from(ivHex, 'hex')
  const tag = Buffer.from(tagHex, 'hex')
  const ct = Buffer.from(ctHex, 'hex')
  const key = getMasterKey()
  const decipher = createDecipheriv(ALGO, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8')
}
