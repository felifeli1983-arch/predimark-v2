'use client'

import { useEffect, useState } from 'react'
import { getPricesBatch } from '@/lib/polymarket/clob'

/**
 * Hook React: midpoint batch per N token IDs in 1 sola request al
 * CLOB `/prices` endpoint, polling intervalMs.
 *
 * Polymarket /prices ritorna best ask + best bid per token. Calcoliamo
 * midpoint = (ask + bid) / 2 lato client per consistency con
 * useLiveMidpoint (single token via WS book).
 *
 * Per MultiOutcomeCard / MultiStrikeCard sostituisce il polling
 * fetchEventById(id) (~10x più heavy perché ritorna full event tree).
 */
export function useBatchPrices(
  tokenIds: string[],
  intervalMs: number = 15_000
): Record<string, number> {
  const [prices, setPrices] = useState<Record<string, number>>({})

  useEffect(() => {
    if (tokenIds.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrices({})
      return
    }
    let cancelled = false

    async function refresh() {
      try {
        const [bids, asks] = await Promise.all([
          getPricesBatch(tokenIds, 'SELL'), // best bid per token
          getPricesBatch(tokenIds, 'BUY'), // best ask per token
        ])
        if (cancelled) return
        const mids: Record<string, number> = {}
        for (const id of tokenIds) {
          const bid = bids[id]
          const ask = asks[id]
          if (bid !== undefined && ask !== undefined) {
            mids[id] = (bid + ask) / 2
          } else if (bid !== undefined) {
            mids[id] = bid
          } else if (ask !== undefined) {
            mids[id] = ask
          }
        }
        setPrices(mids)
      } catch {
        /* silenzioso — UI fallback su yesPrice statico */
      }
    }

    void refresh()
    const id = setInterval(refresh, intervalMs)
    return () => {
      cancelled = true
      clearInterval(id)
    }
    // tokenIds.join è la dep stabile per evitare re-effect se l'array
    // viene re-allocato senza cambiare contenuto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenIds.join('|'), intervalMs])

  return prices
}
