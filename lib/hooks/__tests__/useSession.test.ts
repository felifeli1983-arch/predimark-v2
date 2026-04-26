import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('@privy-io/react-auth', () => ({
  usePrivy: vi.fn(),
}))

import { useSession } from '../useSession'
import { usePrivy } from '@privy-io/react-auth'

describe('useSession', () => {
  const mockGetAccessToken = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePrivy).mockReturnValue({
      getAccessToken: mockGetAccessToken,
    } as never)
  })

  it('inizia in stato idle', () => {
    const { result } = renderHook(() => useSession())
    expect(result.current.status).toBe('idle')
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('errore se getAccessToken ritorna null', async () => {
    mockGetAccessToken.mockResolvedValueOnce(null)
    const { result } = renderHook(() => useSession())

    await act(async () => {
      await result.current.fetchSession()
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toContain('JWT Privy non disponibile')
  })

  it('ok con risposta 200', async () => {
    mockGetAccessToken.mockResolvedValueOnce('valid-jwt')

    const mockResponse = {
      user: {
        id: 'uuid-test',
        wallet_address: '0xabc',
        username: null,
        email: 'test@example.com',
        country_code: 'DE',
        geo_block_status: 'allowed',
        language: null,
        onboarding_completed: false,
      },
      session: { expires_at: '2026-05-03T00:00:00Z' },
    }

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as never)

    const { result } = renderHook(() => useSession())

    await act(async () => {
      await result.current.fetchSession()
    })

    expect(result.current.status).toBe('ok')
    expect(result.current.data?.user.id).toBe('uuid-test')
    expect(result.current.data?.user.geo_block_status).toBe('allowed')
  })

  it('errore con risposta HTTP 401', async () => {
    mockGetAccessToken.mockResolvedValueOnce('invalid-jwt')

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: { code: 'AUTH_INVALID', message: 'JWT non valido' } }),
    } as never)

    const { result } = renderHook(() => useSession())

    await act(async () => {
      await result.current.fetchSession()
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('JWT non valido')
  })
})
