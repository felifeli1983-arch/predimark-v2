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
