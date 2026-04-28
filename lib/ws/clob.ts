/**
 * Wrapper Polymarket CLOB WebSocket.
 *
 * Endpoint: wss://ws-subscriptions-clob.polymarket.com/ws/market
 * Topic: `book` (orderbook) | `price_change` (last trade) | `last_trade_price`
 *
 * V2 compatibility: per docs Polymarket "WebSocket URLs are unchanged. Most
 * message payloads are unchanged." → questo wrapper è valido sia V1 che V2.
 * L'unico campo che cambia semantica in V2 è `fee_rate_bps` su last_trade_price
 * (ora riflette la fee effettiva applicata al trade) — non lo usiamo ancora.
 *
 * Read-only: nessuna firma necessaria per dati pubblici.
 */

import { subscribe, type WsListener } from './SingletonWS'

const CLOB_WS_URL = 'wss://ws-subscriptions-clob.polymarket.com/ws/market'

export interface PriceLevel {
  price: string
  size: string
}

export interface BookEvent {
  event_type: 'book'
  asset_id: string
  market: string
  buys?: PriceLevel[]
  sells?: PriceLevel[]
  bids?: PriceLevel[]
  asks?: PriceLevel[]
  timestamp: string
}

export interface PriceChangeEvent {
  event_type: 'price_change'
  asset_id: string
  market: string
  price: string
  size: string
  side: 'BUY' | 'SELL'
  timestamp: string
}

function buildInitMessage(assetIds: string[]) {
  return {
    type: 'market',
    assets_ids: assetIds,
  }
}

/**
 * Subscribe a `price_change` per uno o più asset CLOB.
 * Ritorna la unsubscribe function.
 */
export function subscribeToPriceChange(
  assetIds: string[],
  callback: (event: PriceChangeEvent) => void
): () => void {
  const filtered = assetIds.filter(Boolean)
  if (filtered.length === 0) return () => undefined

  const wrapped: WsListener = (data) => {
    if (
      data &&
      typeof data === 'object' &&
      (data as { event_type?: string }).event_type === 'price_change'
    ) {
      const ev = data as PriceChangeEvent
      if (filtered.includes(ev.asset_id)) callback(ev)
    }
  }

  return subscribe(CLOB_WS_URL, 'price_change', wrapped, {
    initMessage: buildInitMessage(filtered),
  })
}

/**
 * Subscribe a `book` (snapshot + delta orderbook) per uno o più asset CLOB.
 * Ritorna la unsubscribe function.
 */
export function subscribeToBook(
  assetIds: string[],
  callback: (event: BookEvent) => void
): () => void {
  const filtered = assetIds.filter(Boolean)
  if (filtered.length === 0) return () => undefined

  const wrapped: WsListener = (data) => {
    if (
      data &&
      typeof data === 'object' &&
      (data as { event_type?: string }).event_type === 'book'
    ) {
      const ev = data as BookEvent
      if (filtered.includes(ev.asset_id)) callback(ev)
    }
  }

  return subscribe(CLOB_WS_URL, 'book', wrapped, {
    initMessage: buildInitMessage(filtered),
  })
}
