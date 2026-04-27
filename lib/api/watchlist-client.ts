import type { WatchlistItem } from '@/app/api/v1/watchlist/route'

export interface AddWatchlistPayload {
  polymarketMarketId: string
  polymarketEventId: string
  slug: string
  title: string
  cardKind: string
  category: string
  image?: string
  currentYesPrice?: number
}

const ENDPOINT = '/api/v1/watchlist'

async function request<T>(token: string, url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    let detail = ''
    try {
      const body = (await res.json()) as { error?: { message?: string } }
      detail = body?.error?.message ?? ''
    } catch {
      /* ignore */
    }
    throw new Error(`HTTP ${res.status}${detail ? ` — ${detail}` : ''}`)
  }
  if (res.status === 204) return null as T
  return (await res.json()) as T
}

/** GET watchlist dell'utente loggato (richiede Privy JWT). */
export async function fetchWatchlist(token: string): Promise<WatchlistItem[]> {
  const data = await request<{ items: WatchlistItem[] }>(token, ENDPOINT)
  return data.items
}

/** POST: aggiunge un market alla watchlist (idempotente lato server). */
export async function postWatchlistAdd(
  token: string,
  payload: AddWatchlistPayload
): Promise<{ id: string }> {
  return request<{ id: string }>(token, ENDPOINT, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** DELETE: rimuove un market dalla watchlist (idempotente). */
export async function deleteWatchlist(token: string, polymarketMarketId: string): Promise<void> {
  await request<null>(token, `${ENDPOINT}/${encodeURIComponent(polymarketMarketId)}`, {
    method: 'DELETE',
  })
}
