'use client'

import { useEffect, useState } from 'react'
import { subscribeToCryptoPrices, type CryptoSource } from '../rtds'

export interface CryptoLivePrice {
  price: number | null
  change24h: number | null
  loading: boolean
}

/**
 * Hook React: ritorna prezzo live + variazione 24h per un simbolo crypto.
 *
 * @param symbol  es. 'btcusdt', 'ethusdt' (case-insensitive)
 * @param source  'binance' (default round 1h/1d) | 'chainlink' (consigliato round 5m/15m)
 *
 * Passa stringa vuota per disattivare la subscription.
 */
export function useCryptoLivePrice(symbol: string, source: CryptoSource): CryptoLivePrice {
  const [price, setPrice] = useState<number | null>(null)
  const [change24h, setChange24h] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!symbol) {
      // Reset al disabilitato (pattern subscription)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrice(null)
      setChange24h(null)
      setLoading(false)
      return
    }

    // Reset al cambio di symbol/source
    setPrice(null)
    setChange24h(null)
    setLoading(true)

    const unsubscribe = subscribeToCryptoPrices([symbol], source, (event) => {
      const p = parseFloat(event.price)
      if (Number.isFinite(p)) setPrice(p)
      if (event.change24h !== undefined) {
        const c = parseFloat(event.change24h)
        if (Number.isFinite(c)) setChange24h(c)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [symbol, source])

  return { price, change24h, loading }
}
