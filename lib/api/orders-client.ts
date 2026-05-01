import type { OpenOrderRow } from '@/lib/polymarket/order-post'

export type { OpenOrderRow }

interface OpenOrdersResponse {
  items: OpenOrderRow[]
  meta: { total: number; reservedSize: number }
}

export async function fetchOpenOrders(
  token: string,
  filters: { market?: string; assetId?: string } = {}
): Promise<OpenOrdersResponse> {
  const params = new URLSearchParams()
  if (filters.market) params.set('market', filters.market)
  if (filters.assetId) params.set('asset_id', filters.assetId)
  const url = `/api/v1/users/me/orders/open${params.toString() ? `?${params}` : ''}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
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
  return (await res.json()) as OpenOrdersResponse
}

export async function deleteOrder(token: string, orderId: string): Promise<void> {
  const res = await fetch(`/api/v1/trades/orders/${encodeURIComponent(orderId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
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
}

export async function deleteAllOrders(token: string): Promise<void> {
  const res = await fetch('/api/v1/trades/orders/all', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
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
}

export async function deleteMarketOrders(
  token: string,
  filters: { market?: string; assetId?: string }
): Promise<{ canceled: number; notCanceled: number }> {
  const params = new URLSearchParams()
  if (filters.market) params.set('market', filters.market)
  if (filters.assetId) params.set('assetId', filters.assetId)
  const res = await fetch(`/api/v1/trades/orders/market?${params}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
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
  const body = (await res.json()) as { counts: { canceled: number; notCanceled: number } }
  return body.counts
}

/** Check eligibilità maker rebate per N ordini in batch. */
export async function fetchOrderScoring(
  token: string,
  orderIds: string[]
): Promise<Record<string, boolean>> {
  if (orderIds.length === 0) return {}
  const res = await fetch('/api/v1/trades/orders/scoring', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ orderIds }),
  })
  if (!res.ok) return {}
  const body = (await res.json()) as { scoring?: Record<string, boolean> }
  return body.scoring ?? {}
}
