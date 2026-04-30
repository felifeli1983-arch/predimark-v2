'use client'

import { useEffect, useState } from 'react'
import { subscribeToCryptoPrices, type CryptoSource } from '../rtds'
import { subscribeToBinanceMiniTicker } from '../binance'

export interface CryptoLivePrice {
  price: number | null
  change24h: number | null
  loading: boolean
}

/**
 * Hook React: ritorna prezzo live + variazione 24h per un simbolo crypto.
 *
 * @param symbol  es. 'btcusdt', 'ethusdt' (case-insensitive)
 * @param source  'binance' (default) | 'chainlink' (consigliato round 5m/15m)
 *
 * Strategia di fallback:
 *  1. Subscribe primario (Binance public WS o Polymarket RTDS Chainlink)
 *  2. Se dopo 5s non arriva nessun price → fallback automatico Binance public
 *     (più affidabile del Polymarket RTDS che a volte non risponde).
 *
 * Passa stringa vuota per disattivare la subscription.
 */
export function useCryptoLivePrice(symbol: string, source: CryptoSource): CryptoLivePrice {
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

    let receivedPrice = false
    let primaryUnsub: (() => void) | null = null
    let fallbackUnsub: (() => void) | null = null
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null

    function handlePrice(p: number, c?: number) {
      receivedPrice = true
      setPrice(p)
      if (c !== undefined && Number.isFinite(c)) setChange24h(c)
      setLoading(false)
    }

    if (source === 'binance') {
      // Binance public WS direct — più affidabile e veloce per qualsiasi
      // simbolo standard. Polymarket RTDS sembra deprecato in V2.
      primaryUnsub = subscribeToBinanceMiniTicker(symbol, (event) => {
        handlePrice(event.close, event.changePercent24h)
      })
    } else {
      // chainlink: tentativo via Polymarket RTDS, fallback Binance dopo 5s
      primaryUnsub = subscribeToCryptoPrices([symbol], source, (event) => {
        const p = parseFloat(event.price)
        if (!Number.isFinite(p)) return
        const c = event.change24h !== undefined ? parseFloat(event.change24h) : undefined
        handlePrice(p, c)
      })
      fallbackTimer = setTimeout(() => {
        if (receivedPrice) return
        fallbackUnsub = subscribeToBinanceMiniTicker(symbol, (event) => {
          handlePrice(event.close, event.changePercent24h)
        })
      }, 5_000)
    }

    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer)
      primaryUnsub?.()
      fallbackUnsub?.()
    }
  }, [symbol, source])

  return { price, change24h, loading }
}
