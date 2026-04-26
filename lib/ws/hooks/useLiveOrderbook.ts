'use client'

import { useEffect, useState } from 'react'
import { subscribeToBook, type PriceLevel } from '../clob'

export interface OrderLevel {
  price: number
  size: number
}

export interface OrderbookData {
  bids: OrderLevel[]
  asks: OrderLevel[]
}

const EMPTY: OrderbookData = { bids: [], asks: [] }

function parseLevels(raw: PriceLevel[] | undefined): OrderLevel[] {
  if (!raw) return []
  return raw
    .map((l) => ({ price: parseFloat(l.price), size: parseFloat(l.size) }))
    .filter((l) => Number.isFinite(l.price) && Number.isFinite(l.size))
}

/**
 * Hook React: ritorna bids/asks live per un asset CLOB.
 * Passa `null` come assetId per disattivare la subscription.
 *
 * Polymarket invia il book come `buys`/`sells` (alias di `bids`/`asks`).
 * Normalizziamo qui dentro al formato `{ price, size }` con number.
 */
export function useLiveOrderbook(assetId: string | null): OrderbookData {
  const [book, setBook] = useState<OrderbookData>(EMPTY)

  useEffect(() => {
    if (!assetId) {
      // Reset quando il subscriber si disattiva (pattern subscription, non cascading)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBook(EMPTY)
      return
    }

    // Reset al cambio di asset
    setBook(EMPTY)

    const unsubscribe = subscribeToBook([assetId], (event) => {
      const bids = parseLevels(event.bids ?? event.buys)
      const asks = parseLevels(event.asks ?? event.sells)
      setBook({ bids, asks })
    })

    return unsubscribe
  }, [assetId])

  return book
}
