'use client'

/**
 * Polymarket User Channel WebSocket — Doc WebSocket User Channel.
 *
 * Endpoint: wss://ws-subscriptions-clob.polymarket.com/ws/user
 *
 * Auth: invia init message con API creds dell'utente al connect:
 *   { type: 'user', auth: { apiKey, secret, passphrase }, markets: [] }
 *
 * Eventi push:
 *  - TRADE: order matched/mined/confirmed/retrying/failed
 *  - ORDER: placement / update (partial fill) / cancellation
 *
 * Pattern: 1 connessione WS per utente loggato. Multipli listener
 * (NotificationBell, OpenOrdersList) si subscribano alla stessa.
 *
 * Auto-reconnect con exponential backoff (max 30s). Le creds vengono
 * fetchate via /api/v1/users/me/clob-credentials (Privy auth).
 */

import { subscribe, type WsListener } from './SingletonWS'

const USER_WS_URL = 'wss://ws-subscriptions-clob.polymarket.com/ws/user'

export interface UserCreds {
  apiKey: string
  secret: string
  passphrase: string
}

export interface UserOrderEvent {
  event_type: 'order'
  /** PLACEMENT | UPDATE | CANCELLATION */
  type: 'PLACEMENT' | 'UPDATE' | 'CANCELLATION'
  id: string
  market: string
  asset_id: string
  side: 'BUY' | 'SELL'
  price: string
  size: string
  size_matched: string
  outcome: string
  owner: string
  timestamp: string
  status?: string
}

export interface UserTradeEvent {
  event_type: 'trade'
  /** MATCHED → MINED → CONFIRMED | RETRYING → FAILED */
  status: 'MATCHED' | 'MINED' | 'CONFIRMED' | 'RETRYING' | 'FAILED'
  id: string
  market: string
  asset_id: string
  side: 'BUY' | 'SELL'
  price: string
  size: string
  outcome: string
  owner: string
  taker_order_id: string
  transaction_hash?: string
  timestamp: string
}

export type UserChannelEvent = UserOrderEvent | UserTradeEvent

/**
 * Apre (o riusa) WS User Channel autenticato e invoca callback su ogni
 * evento order/trade del set di markets specificato (vuoto = tutti i
 * markets dell'utente).
 *
 * Ritorna unsubscribe function per cleanup.
 *
 * NOTA: il SingletonWS multiplexa per URL — qui usiamo un URL unico
 * senza creds (creds vanno nel init message body), quindi se 2 utenti
 * diversi usano lo stesso browser (raro), serverside gli arriva la
 * SECONDA init e overwrite. Mitigato dal fatto che cambio user implica
 * logout → cleanup → unsubscribe → connessione chiusa.
 */
export function subscribeToUserChannel(
  creds: UserCreds,
  markets: string[],
  callback: (event: UserChannelEvent) => void
): () => void {
  const initMessage = {
    type: 'user',
    auth: {
      apiKey: creds.apiKey,
      secret: creds.secret,
      passphrase: creds.passphrase,
    },
    markets: markets.filter(Boolean),
  }

  const listener: WsListener = (data) => {
    if (typeof data !== 'object' || data === null) return
    const evt = data as Record<string, unknown>
    const eventType = evt.event_type
    if (eventType === 'order' || eventType === 'trade') {
      callback(evt as unknown as UserChannelEvent)
    }
  }

  return subscribe(USER_WS_URL, 'user', listener, { initMessage })
}

/**
 * Helper: fetcha le creds correnti dall'endpoint server-side.
 * Returns null se l'utente non è onboarded o JWT scaduto.
 */
export async function fetchUserClobCreds(token: string): Promise<UserCreds | null> {
  try {
    const res = await fetch('/api/v1/users/me/clob-credentials', {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const body = (await res.json()) as UserCreds
    if (!body.apiKey || !body.secret || !body.passphrase) return null
    return body
  } catch {
    return null
  }
}
