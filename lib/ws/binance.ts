/**
 * Binance public WebSocket — feed prezzi crypto live.
 *
 * Endpoint pubblico, no auth. Symbol must be lowercase.
 * Doc: https://developers.binance.com/docs/binance-spot-api-docs/web-socket-streams
 *
 * Stream usato: `<symbol>@miniTicker` — payload leggero (~150 bytes/sec):
 *   {
 *     e: "24hrMiniTicker",
 *     s: "BTCUSDT",
 *     c: "98234.50",  // close price (current)
 *     o: "97800.00",  // open 24h ago
 *     h, l, v, q
 *   }
 *
 * Più affidabile del Polymarket RTDS (`rpc.polymarket.com`) che in V2
 * sembra deprecato/non risponde.
 */

import { subscribe, type WsListener } from './SingletonWS'

export interface BinanceMiniTickerEvent {
  symbol: string
  /** Close price corrente (USD per pair USDT). */
  close: number
  /** Open price 24h fa. */
  open24h: number
  /** Variazione 24h in % calcolata da close vs open. */
  changePercent24h: number
}

interface BinanceRawEvent {
  e: string
  s: string
  c: string
  o: string
}

/** WS combined stream — fixed URL, channels via subscription path. */
const BINANCE_WS_BASE = 'wss://stream.binance.com:9443/ws'

/**
 * Subscribe a mini-ticker per un singolo symbol Binance (es. 'btcusdt').
 * Apre una connessione dedicata per simbolo (Binance preferisce stream
 * separati per ridotta latenza single-symbol).
 *
 * Ritorna unsubscribe function.
 */
export function subscribeToBinanceMiniTicker(
  symbol: string,
  callback: (event: BinanceMiniTickerEvent) => void
): () => void {
  if (!symbol) return () => undefined
  const lower = symbol.toLowerCase()
  const url = `${BINANCE_WS_BASE}/${lower}@miniTicker`

  const wrapped: WsListener = (data) => {
    if (!data || typeof data !== 'object') return
    const raw = data as BinanceRawEvent
    if (raw.e !== '24hrMiniTicker') return
    const close = parseFloat(raw.c)
    const open = parseFloat(raw.o)
    if (!Number.isFinite(close) || !Number.isFinite(open) || open <= 0) return
    callback({
      symbol: raw.s,
      close,
      open24h: open,
      changePercent24h: ((close - open) / open) * 100,
    })
  }

  // Topic '*' perché Binance non manda event_type — il routing
  // SingletonWS userà il fallback '*' listener.
  return subscribe(url, '*', wrapped)
}
