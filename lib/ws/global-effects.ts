'use client'

/**
 * Singleton global WS effects — collega gli event channel CLOB
 * (tick_size_change, market_resolved) a side-effect cross-app:
 *
 * - tick_size_change → invalida cache _detailsCache (clob.ts) per il
 *   tokenId. Critico perché ordini con tick vecchio vengono rifiutati
 *   dal CLOB Polymarket (Doc Orderbook WARNING).
 *
 * - market_resolved → invalida cache eventi locali e dispatch un
 *   evento custom-window `auktora:market-resolved` che le card crypto
 *   ascoltano per auto-transition immediato (no più 5s polling).
 *
 * Il listener si attiva una sola volta — chiamato da CryptoCard +
 * altri componenti che subscribe a tokenId, perché il subscription-set
 * aggregator gestisce il batching correttamente (1 subscription per
 * tokenId condivisa tra tutti i listener).
 */

import { invalidateMarketDetailsCache } from '@/lib/polymarket/clob'
import {
  subscribeToTickSizeChange,
  subscribeToMarketResolved,
  type MarketResolvedEvent,
} from './clob'

const tickSubscribers = new Set<string>()
const resolvedSubscribers = new Set<string>()

/**
 * Subscribe a tick_size_change per un tokenId — auto-invalida cache.
 * Idempotente per stesso tokenId (no-op se già subscribed).
 *
 * Ritorna unsub function. La cache stay invalidated finché un'altra
 * call la riempie.
 */
export function subscribeToTickInvalidation(tokenId: string | null): () => void {
  if (!tokenId || tickSubscribers.has(tokenId)) return () => undefined
  tickSubscribers.add(tokenId)
  const unsub = subscribeToTickSizeChange([tokenId], (event) => {
    invalidateMarketDetailsCache(event.asset_id)
    if (typeof window !== 'undefined') {
      // Dispatch event così componenti possono react (es. TradeWidget
      // mostra "tick changed, recalculating...").
      window.dispatchEvent(
        new CustomEvent('auktora:tick-size-change', {
          detail: {
            assetId: event.asset_id,
            oldTickSize: event.old_tick_size,
            newTickSize: event.new_tick_size,
          },
        })
      )
    }
  })
  return () => {
    tickSubscribers.delete(tokenId)
    unsub()
  }
}

/**
 * Subscribe a market_resolved (broadcast tutti i markets — il filter
 * lo fa il caller). Dispatch evento window custom così CryptoCard +
 * RedeemAutoPrompt + qualsiasi altro componente possono react.
 *
 * Subscription single-shot per tokenId (idempotente).
 */
export function subscribeToMarketResolvedBroadcast(
  tokenId: string | null,
  callback?: (event: MarketResolvedEvent) => void
): () => void {
  if (!tokenId) return () => undefined
  const isFirst = !resolvedSubscribers.has(tokenId)
  resolvedSubscribers.add(tokenId)
  const unsub = subscribeToMarketResolved([tokenId], (event) => {
    if (typeof window !== 'undefined' && isFirst) {
      window.dispatchEvent(
        new CustomEvent('auktora:market-resolved', {
          detail: event,
        })
      )
    }
    callback?.(event)
  })
  return () => {
    resolvedSubscribers.delete(tokenId)
    unsub()
  }
}
