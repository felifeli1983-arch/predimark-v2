import { describe, it, expect, beforeEach } from 'vitest'
import { encrypt, decrypt } from '../encrypt'

describe('crypto/encrypt', () => {
  beforeEach(() => {
    process.env.POLYMARKET_API_ENCRYPTION_KEY = 'a'.repeat(64)
  })

  it('round-trips short and long strings', () => {
    for (const sample of [
      's',
      'auktora',
      '019db1bc-7f98-7239-8e7e-14b167acdac5',
      'x'.repeat(1024),
    ]) {
      const enc = encrypt(sample)
      expect(decrypt(enc)).toBe(sample)
    }
  })

  it('produce ciphertext distinto per stesso plaintext (IV randomico)', () => {
    const a = encrypt('same-secret')
    const b = encrypt('same-secret')
    expect(a).not.toBe(b)
    expect(decrypt(a)).toBe('same-secret')
    expect(decrypt(b)).toBe('same-secret')
  })

  it('rifiuta ciphertext alterato (auth tag fallisce)', () => {
    const enc = encrypt('top-secret')
    const [iv, tag, ct] = enc.split(':') as [string, string, string]
    const tampered = `${iv}:${tag}:${ct.slice(0, -2)}ff`
    expect(() => decrypt(tampered)).toThrow()
  })

  it('rifiuta payload malformato', () => {
    expect(() => decrypt('not:valid')).toThrow('malformato')
  })

  it('chiavi differenti producono ciphertext non interoperabili', () => {
    const enc = encrypt('payload')
    process.env.POLYMARKET_API_ENCRYPTION_KEY = 'b'.repeat(64)
    expect(() => decrypt(enc)).toThrow()
  })
})
