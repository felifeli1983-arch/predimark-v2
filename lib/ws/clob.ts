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

// ============================================================
//  Aggregator pattern per evitare init message overwrite
// ============================================================
// Polymarket WS `/ws/market` accetta UN messaggio di init per
// connessione, e il server REPLACE la subscription set con
// `assets_ids` di quel messaggio. Se 200 card chiamano ognuna
// `subscribeToBook([singleId])` con singleton WS, il 199esimo init
// SOVRASCRIVE i precedenti → solo l'ultimo asset è "vivo" e gli
// altri non ricevono eventi.
//
// Soluzione: maintenance side-table di asset_id → subscriber count.
// Quando il set cambia (add/remove), inviamo un FRESH init con la
// union completa al WS. Le incoming events vengono filtrate per
// `asset_id` ai listener interessati come prima.
//
// L'init `{ type: 'market', assets_ids: [...union] }` accetta
// sostituire la subscription, quindi è safe per add/remove.

const subscribedAssetCounts = new Map<string, number>()
let lastInitJson = ''

function getCurrentInitMessage(): { type: string; assets_ids: string[] } {
  return {
    type: 'market',
    assets_ids: [...subscribedAssetCounts.keys()],
  }
}

/**
 * Aggiorna il subscription set globale (add o remove) e rinviano
 * un init message al WS solo se la lista è realmente cambiata.
 * Diff via `lastInitJson` per evitare resend inutili sotto throttle.
 */
function updateSubscription(assetIds: string[], delta: 1 | -1): void {
  let changed = false
  for (const id of assetIds) {
    const cur = subscribedAssetCounts.get(id) ?? 0
    const next = cur + delta
    if (next <= 0) {
      if (subscribedAssetCounts.delete(id)) changed = true
    } else {
      if (cur === 0) changed = true
      subscribedAssetCounts.set(id, next)
    }
  }
  if (!changed) return
  const init = getCurrentInitMessage()
  const json = JSON.stringify(init)
  if (json === lastInitJson) return
  lastInitJson = json
  // Trigger re-publish via no-op subscribe per spedire l'init message
  // su quella socket. Più semplice di esporre un sendRaw da SingletonWS.
  if (init.assets_ids.length > 0) {
    // Tracker dummy listener — non riceve nulla perché topic '__init__' non
    // è usato dalla logica di routing. Serve solo a riusare il channel.
    const dummy: WsListener = () => undefined
    const unsub = subscribe(CLOB_WS_URL, '__init__', dummy, { initMessage: init })
    // Subito unsubscribe — il init è già stato sent dalla subscribe call.
    unsub()
  }
}

/**
 * Subscribe a `price_change` per uno o più asset CLOB.
 * Aggiorna il subscription-set globale e re-invia init con la union.
 */
export function subscribeToPriceChange(
  assetIds: string[],
  callback: (event: PriceChangeEvent) => void
): () => void {
  const filtered = assetIds.filter(Boolean)
  if (filtered.length === 0) return () => undefined

  updateSubscription(filtered, 1)

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

  const unsubBase = subscribe(CLOB_WS_URL, 'price_change', wrapped)
  return () => {
    unsubBase()
    updateSubscription(filtered, -1)
  }
}

/**
 * Subscribe a `book` (snapshot + delta orderbook) per uno o più asset CLOB.
 * Aggiorna il subscription-set globale e re-invia init con la union.
 */
export function subscribeToBook(
  assetIds: string[],
  callback: (event: BookEvent) => void
): () => void {
  const filtered = assetIds.filter(Boolean)
  if (filtered.length === 0) return () => undefined

  updateSubscription(filtered, 1)

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

  const unsubBase = subscribe(CLOB_WS_URL, 'book', wrapped)
  return () => {
    unsubBase()
    updateSubscription(filtered, -1)
  }
}
