'use client'

import { useEffect, useState } from 'react'
import type { CryptoSource } from '../rtds'
import { subscribeToBinanceMiniTicker } from '../binance'

export type { CryptoSource }

export interface CryptoLivePrice {
  price: number | null
  change24h: number | null
  loading: boolean
}

/**
 * Hook React: ritorna prezzo live + variazione 24h per un simbolo crypto.
 *
 * @param symbol  es. 'btcusdt', 'ethusdt' (case-insensitive)
 * @param source  'binance' (default) | 'chainlink' — accettato per
 *                retrocompatibilità ma SEMPRE usa Binance ora. Il
 *                Polymarket RTDS (rpc.polymarket.com) sembra deprecato
 *                in V2 e non emette eventi → causava livePrice null
 *                permanente per round 5min/15min.
 *
 * Passa stringa vuota per disattivare la subscription.
 */
export function useCryptoLivePrice(symbol: string, _source?: CryptoSource): CryptoLivePrice {
  const [price, setPrice] = useState<number | null>(null)
  const [change24h, setChange24h] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!symbol) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrice(null)
      setChange24h(null)
      setLoading(false)
      return
    }

    setPrice(null)
    setChange24h(null)
    setLoading(true)

    const unsubscribe = subscribeToBinanceMiniTicker(symbol, (event) => {
      setPrice(event.close)
      setChange24h(event.changePercent24h)
      setLoading(false)
    })

    return unsubscribe
  }, [symbol])

  return { price, change24h, loading }
}
