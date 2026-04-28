import { describe, it, expect } from 'vitest'
import {
  evaluateGeoStatus,
  extractGeoFromHeaders,
  BLOCKED_COUNTRIES,
  CLOSE_ONLY_COUNTRIES,
} from '../geoblock'

describe('polymarket/geoblock', () => {
  it('allowed: UAE / HK / BR / TR (target tier 1)', () => {
    for (const cc of ['AE', 'HK', 'BR', 'TR', 'AR', 'RO']) {
      const res = evaluateGeoStatus(cc, null)
      expect(res.allowed).toBe(true)
    }
  })

  it('blocked: US / IT / FR / GB / DE / RU / IR', () => {
    for (const cc of ['US', 'IT', 'FR', 'GB', 'DE', 'RU', 'IR']) {
      const res = evaluateGeoStatus(cc, null)
      expect(res.allowed).toBe(false)
      if (!res.allowed) expect(res.reason).toBe('blocked')
    }
  })

  it('close-only: SG / PL / TH / TW', () => {
    for (const cc of ['SG', 'PL', 'TH', 'TW']) {
      const res = evaluateGeoStatus(cc, null)
      expect(res.allowed).toBe(false)
      if (!res.allowed) expect(res.reason).toBe('close-only')
    }
  })

  it('region-blocked: Ontario CA-ON', () => {
    const res = evaluateGeoStatus('CA', 'ON')
    expect(res.allowed).toBe(false)
    if (!res.allowed) expect(res.reason).toBe('region-blocked')
  })

  it('CA non-Ontario allowed', () => {
    const res = evaluateGeoStatus('CA', 'BC')
    expect(res.allowed).toBe(true)
  })

  it('unknown country → blocked (fail-safe)', () => {
    const res = evaluateGeoStatus(null, null)
    expect(res.allowed).toBe(false)
  })

  it('case insensitive', () => {
    expect(evaluateGeoStatus('us', null).allowed).toBe(false)
    expect(evaluateGeoStatus('ae', null).allowed).toBe(true)
  })

  it('lists copertura sanity', () => {
    expect(BLOCKED_COUNTRIES.size).toBeGreaterThanOrEqual(30)
    expect(CLOSE_ONLY_COUNTRIES.size).toBe(4)
  })

  it('extractGeoFromHeaders Vercel headers', () => {
    const h = new Headers({
      'x-vercel-ip-country': 'AE',
      'x-vercel-ip-country-region': 'DU',
    })
    expect(extractGeoFromHeaders(h)).toEqual({ country: 'AE', region: 'DU' })
  })

  it('extractGeoFromHeaders Cloudflare fallback', () => {
    const h = new Headers({ 'cf-ipcountry': 'BR' })
    expect(extractGeoFromHeaders(h)).toEqual({ country: 'BR', region: null })
  })

  it('extractGeoFromHeaders nessun header → null', () => {
    expect(extractGeoFromHeaders(new Headers())).toEqual({ country: null, region: null })
  })
})
