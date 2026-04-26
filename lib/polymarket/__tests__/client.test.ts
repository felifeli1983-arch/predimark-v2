import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { gammaGet, GammaApiError } from '../client'

describe('gammaGet', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('200 → ritorna i dati JSON', async () => {
    const mockData = { events: [{ id: '1' }] }
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    } as unknown as Response)

    const result = await gammaGet<typeof mockData>('/events')
    expect(result).toEqual(mockData)
  })

  it('404 → lancia GammaApiError con status 404, no retry', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as unknown as Response)
    global.fetch = fetchMock

    await expect(gammaGet('/events/missing')).rejects.toThrow(GammaApiError)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('errore di rete → retry fino a MAX_RETRIES (3 tentativi totali)', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'))
    global.fetch = fetchMock

    await expect(gammaGet('/events')).rejects.toThrow('network down')
    // 1 + 2 retries = 3
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('500 → ritenta fino a MAX_RETRIES (3 tentativi totali)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    } as unknown as Response)
    global.fetch = fetchMock

    await expect(gammaGet('/events')).rejects.toThrow(GammaApiError)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('costruisce URL con query params, skippa undefined', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([]),
    } as unknown as Response)
    global.fetch = fetchMock

    await gammaGet('/events', { limit: 5, slug: 'foo', closed: undefined })

    const callArgs = fetchMock.mock.calls[0]
    const url = callArgs?.[0] as string
    expect(url).toContain('limit=5')
    expect(url).toContain('slug=foo')
    expect(url).not.toContain('closed=')
  })
})
