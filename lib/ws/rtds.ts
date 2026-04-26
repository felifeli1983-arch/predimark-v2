/**
 * Wrapper Polymarket RTDS WebSocket.
 *
 * Endpoint: wss://rpc.polymarket.com
 * Topic: `activity` (trade feed) | `crypto_prices` (Binance) | `crypto_prices_chainlink` (Chainlink)
 *
 * Read-only: nessuna firma necessaria. Connessione separata dal CLOB.
 */

import { subscribe, type WsListener } from './SingletonWS'

const RTDS_URL = 'wss://rpc.polymarket.com'

export type CryptoSource = 'binance' | 'chainlink'

export interface ActivityEvent {
  event_type: 'activity'
  user: string
  side: 'BUY' | 'SELL'
  amount: string
  market: string
  outcome: string
  timestamp: string
  /** Alcune varianti del payload includono il marketId per filtraggio */
  marketId?: string
}

export interface CryptoPriceEvent {
  event_type: 'crypto_prices' | 'crypto_prices_chainlink'
  symbol: string
  price: string
  /** Variazione 24h in % (string nel payload) */
  change24h?: string
  timestamp: string
}

/**
 * Subscribe al feed di trade recenti (topic `activity`).
 * Ritorna la unsubscribe function.
 */
export function subscribeToActivity(callback: (event: ActivityEvent) => void): () => void {
  const wrapped: WsListener = (data) => {
    if (
      data &&
      typeof data === 'object' &&
      (data as { event_type?: string }).event_type === 'activity'
    ) {
      callback(data as ActivityEvent)
    }
  }

  return subscribe(RTDS_URL, 'activity', wrapped, {
    initMessage: { type: 'subscribe', topic: 'activity' },
  })
}

/**
 * Subscribe ai prezzi live di una lista di simboli crypto.
 * `source: 'binance'` → topic `crypto_prices`
 * `source: 'chainlink'` → topic `crypto_prices_chainlink` (consigliato per round 5m/15m)
 *
 * Ritorna la unsubscribe function.
 */
export function subscribeToCryptoPrices(
  symbols: string[],
  source: CryptoSource,
  callback: (event: CryptoPriceEvent) => void
): () => void {
  const filtered = symbols.filter(Boolean).map((s) => s.toLowerCase())
  if (filtered.length === 0) return () => undefined

  const topic = source === 'chainlink' ? 'crypto_prices_chainlink' : 'crypto_prices'

  const wrapped: WsListener = (data) => {
    if (!data || typeof data !== 'object') return
    const ev = data as CryptoPriceEvent
    if (ev.event_type !== topic) return
    if (filtered.includes(ev.symbol?.toLowerCase())) callback(ev)
  }

  return subscribe(RTDS_URL, topic, wrapped, {
    initMessage: { type: 'subscribe', topic, symbols: filtered },
  })
}
