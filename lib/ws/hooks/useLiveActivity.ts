'use client'

import { useEffect, useState } from 'react'
import { subscribeToActivity } from '../rtds'

export interface ActivityItem {
  user: string
  side: 'BUY' | 'SELL'
  amount: number
  market: string
  outcome: string
  timestamp: string
  marketId?: string
}

interface UseLiveActivityOptions {
  /** Numero massimo di items conservati nello state (default 20) */
  limit?: number
  /** Filtra solo eventi che corrispondono a uno di questi marketId */
  marketId?: string
}

/**
 * Hook React: ritorna gli ultimi N trade del feed RTDS, aggiornato live.
 *
 * - Default: ultimi 20 globali
 * - Con `marketId`: filtra solo quel mercato (utile per Crypto card live betting feed)
 */
export function useLiveActivity(options?: UseLiveActivityOptions): ActivityItem[] {
  const limit = options?.limit ?? 20
  const filterMarketId = options?.marketId
  const [items, setItems] = useState<ActivityItem[]>([])

  useEffect(() => {
    // Reset al cambio dei parametri (pattern subscription, non cascading)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems([])

    const unsubscribe = subscribeToActivity((event) => {
      if (filterMarketId && event.marketId !== filterMarketId) return
      const amount = parseFloat(event.amount)
      if (!Number.isFinite(amount)) return

      const item: ActivityItem = {
        user: event.user,
        side: event.side,
        amount,
        market: event.market,
        outcome: event.outcome,
        timestamp: event.timestamp,
        marketId: event.marketId,
      }

      setItems((prev) => [item, ...prev].slice(0, limit))
    })

    return unsubscribe
  }, [limit, filterMarketId])

  return items
}
