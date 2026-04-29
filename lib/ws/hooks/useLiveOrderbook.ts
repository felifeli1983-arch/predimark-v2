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
const CLOB_REST = 'https://clob.polymarket.com'

function parseLevels(raw: PriceLevel[] | undefined): OrderLevel[] {
  if (!raw) return []
  return raw
    .map((l) => ({ price: parseFloat(l.price), size: parseFloat(l.size) }))
    .filter((l) => Number.isFinite(l.price) && Number.isFinite(l.size))
}

/**
 * Hook React: ritorna bids/asks live per un asset CLOB.
 *
 * Strategia:
 *  1. Initial fetch REST `/book?token_id=...` per popolare immediatamente
 *     (CORS aperto verificato 2026-04-30, no proxy server-side necessario).
 *  2. WebSocket `book` channel sovrascrive lo state ad ogni update.
 *
 * Senza l'initial REST il pannello restava bloccato su "Caricamento..."
 * fino al primo trade (anche minuti per market poco attivi).
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
    let cancelled = false

    // 1. Initial REST snapshot
    fetch(`${CLOB_REST}/book?token_id=${encodeURIComponent(assetId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { bids?: PriceLevel[]; asks?: PriceLevel[] } | null) => {
        if (cancelled || !data) return
        setBook({
          bids: parseLevels(data.bids),
          asks: parseLevels(data.asks),
        })
      })
      .catch(() => {
        /* WS subentrerà se disponibile */
      })

    // 2. WebSocket subscription per updates incrementali
    const unsubscribe = subscribeToBook([assetId], (event) => {
      const bids = parseLevels(event.bids ?? event.buys)
      const asks = parseLevels(event.asks ?? event.sells)
      setBook({ bids, asks })
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [assetId])

  return book
}
