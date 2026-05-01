const GAMMA_BASE = 'https://gamma-api.polymarket.com'
const DEFAULT_TIMEOUT_MS = 8000
const MAX_RETRIES = 2

export class GammaApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = 'GammaApiError'
  }
}

type ParamValue = string | number | boolean | undefined

function buildUrl(path: string, params?: Record<string, ParamValue>): string {
  const url = new URL(path, GAMMA_BASE)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

export async function gammaGet<T>(
  path: string,
  params?: Record<string, ParamValue>,
  options?: { revalidate?: number; noCache?: boolean }
): Promise<T> {
  const url = buildUrl(path, params)
  const revalidate = options?.revalidate ?? 30

  let lastError: unknown

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

    try {
      // Endpoint /events ritorna >2MB su limit≥20 — il Next.js fetch
      // cache rifiuta items >2MB con un warning rumoroso e refetcha
      // ogni request. Per i list calls bypassiamo il fetch cache e
      // cachiamo a valle col projection (vedi queries.ts:projectListEvents).
      const res = await fetch(url, {
        signal: controller.signal,
        ...(options?.noCache ? { cache: 'no-store' as const } : { next: { revalidate } }),
      })
      clearTimeout(timeoutId)

      // 4xx/5xx → errore senza retry per 4xx (è un client error, non transitorio)
      if (!res.ok) {
        const message = `Gamma API ${res.status}: ${res.statusText}`
        if (res.status >= 400 && res.status < 500) {
          throw new GammaApiError(res.status, message)
        }
        // 5xx → continua con retry
        lastError = new GammaApiError(res.status, message)
        continue
      }

      return (await res.json()) as T
    } catch (err) {
      clearTimeout(timeoutId)
      // GammaApiError 4xx → propaga subito, no retry
      if (err instanceof GammaApiError && err.status >= 400 && err.status < 500) {
        throw err
      }
      lastError = err
      // Continua col prossimo tentativo (network error, timeout, 5xx)
    }
  }

  if (lastError instanceof Error) throw lastError
  throw new Error('Gamma API: unknown error after retries')
}
