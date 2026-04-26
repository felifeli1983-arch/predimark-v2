import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/privy/server', () => ({
  verifyPrivyToken: vi.fn(),
  getPrivyUser: vi.fn(),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}))

vi.mock('@/lib/geo/resolveGeoBlock', () => ({
  resolveGeoBlockStatus: vi.fn(),
}))

import { POST } from '../route'
import { verifyPrivyToken, getPrivyUser } from '@/lib/privy/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveGeoBlockStatus } from '@/lib/geo/resolveGeoBlock'
import { NextRequest } from 'next/server'

function makeRequest(authHeader?: string) {
  return new NextRequest('http://localhost/api/v1/auth/session', {
    method: 'POST',
    headers: authHeader ? { authorization: authHeader } : {},
  })
}

describe('POST /api/v1/auth/session', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('401 se Authorization header mancante', async () => {
    const res = await POST(makeRequest())
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error.code).toBe('AUTH_MISSING')
  })

  it('401 se JWT Privy invalido', async () => {
    vi.mocked(verifyPrivyToken).mockRejectedValueOnce(new Error('invalid token'))
    const res = await POST(makeRequest('Bearer bad-token'))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error.code).toBe('AUTH_INVALID')
  })

  it('403 se paese geo-bloccato (full_block)', async () => {
    vi.mocked(verifyPrivyToken).mockResolvedValueOnce({ privyDid: 'did:privy:test' })
    vi.mocked(getPrivyUser).mockResolvedValueOnce({ privyDid: 'did:privy:test' })
    vi.mocked(resolveGeoBlockStatus).mockResolvedValueOnce({
      countryCode: 'KP',
      status: 'blocked',
    })
    const res = await POST(makeRequest('Bearer valid-token'))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error.code).toBe('GEO_BLOCKED')
  })

  it('200 con user e session per utente valido', async () => {
    vi.mocked(verifyPrivyToken).mockResolvedValueOnce({ privyDid: 'did:privy:test' })
    vi.mocked(getPrivyUser).mockResolvedValueOnce({
      privyDid: 'did:privy:test',
      email: 'test@example.com',
      walletAddress: '0xabc',
    })
    vi.mocked(resolveGeoBlockStatus).mockResolvedValueOnce({
      countryCode: 'DE',
      status: 'allowed',
    })

    const mockSingle = vi.fn().mockResolvedValueOnce({
      data: {
        id: 'uuid-test',
        wallet_address: '0xabc',
        username: null,
        email: 'test@example.com',
        country_code: 'DE',
        geo_block_status: 'allowed',
        language: null,
        onboarding_completed: false,
      },
      error: null,
    })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockUpsert = vi.fn().mockReturnValue({ select: mockSelect })
    const mockFrom = vi.fn().mockReturnValue({
      upsert: mockUpsert,
      update: vi.fn().mockReturnThis(),
    })
    vi.mocked(createAdminClient).mockReturnValueOnce({ from: mockFrom } as never)

    const res = await POST(makeRequest('Bearer valid-token'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.user.id).toBe('uuid-test')
    expect(body.user.geo_block_status).toBe('allowed')
    expect(body.session.expires_at).toBeDefined()
  })
})
