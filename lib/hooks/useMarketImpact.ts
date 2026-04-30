'use client'

import { useEffect, useState } from 'react'

export interface MarketImpactData {
  /** Prezzo medio stimato per riempire l'ordine. null se loading o errore. */
  fillPrice: number | null
  /** Differenza tra fillPrice e midpoint, in percentuale (es. 1.5 = +1.5%). */
  slippagePct: number | null
  /** True quando la chiamata REST è in flight. */
  loading: boolean
}

const DEBOUNCE_MS = 250

/**
 * Hook che stima il prezzo medio reale per acquistare/vendere `amount` USDC
 * di un tokenID, debounced. Il doc Prices&Orderbook dice che il prezzo
 * displayed (midpoint) NON è quello a cui trade davvero — sono il bid/ask
 * top di book per market orders.
 *
 * Chiama `/api/v1/polymarket/market-impact` (server-side wrapper a
 * `calculateMarketImpact` SDK V2). Il server passa CORS perché clob-v2
 * non ha CORS aperto su tutti gli endpoints.
 *
 * Quando tokenId è null o amount <= 0, ritorna { fillPrice: null }.
 */
export function useMarketImpact(
  tokenId: string | null,
  side: 'BUY' | 'SELL',
  amount: number,
  midpoint: number
): MarketImpactData {
  const [fillPrice, setFillPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!tokenId || amount <= 0 || !Number.isFinite(amount)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFillPrice(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/v1/polymarket/market-impact?token_id=${encodeURIComponent(tokenId)}&side=${side}&amount=${amount}`
        )
        if (!res.ok) {
          if (!cancelled) setFillPrice(null)
          return
        }
        const data = (await res.json()) as { fillPrice: number | null }
        if (!cancelled) setFillPrice(data.fillPrice)
      } catch {
        if (!cancelled) setFillPrice(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [tokenId, side, amount])

  const slippagePct =
    fillPrice !== null && midpoint > 0 ? ((fillPrice - midpoint) / midpoint) * 100 : null

  return { fillPrice, slippagePct, loading }
}
