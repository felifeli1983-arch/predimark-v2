'use client'

import { useEffect, useRef, useState } from 'react'
import { subscribeToPriceChange, subscribeToBook, type PriceLevel } from '../clob'

const CLOB_REST = 'https://clob.polymarket.com'
/**
 * Throttle window: WS book emits 10+ events/sec. React re-render del chart
 * a quella frequenza causa jank. 250ms = 4Hz, sufficiente per UX live.
 */
const THROTTLE_MS = 250

export interface MidpointData {
  midpoint: number | null
  /** Variazione percentuale dal primo midpoint osservato in questa sessione (in %) */
  change: number | null
}

/**
 * Hook React: ritorna midpoint live + variazione % per un singolo asset CLOB.
 *
 * Strategia "always live" come fa Polymarket:
 *  1. Initial REST snapshot da `clob.polymarket.com/midpoint?token_id=...`
 *     (CORS aperto verificato) → primo punto immediato.
 *  2. WS `book` subscription → ogni volta che l'orderbook cambia (aggiunte/
 *     cancellazioni di limit orders), ricalcola midpoint = (topBid+topAsk)/2.
 *     Questo è il canale più "vivo" — fire decine di volte al secondo
 *     anche su mercati senza trade in corso.
 *  3. WS `price_change` subscription → sovrascrive con il prezzo confermato
 *     quando un trade viene eseguito (più accurato dell'inferred-from-book).
 *
 * Risultato: il chart si muove sempre, anche quando non ci sono trade,
 * perché l'orderbook è sempre in flusso.
 */
export function useLiveMidpoint(assetId: string | null): MidpointData {
  const [midpoint, setMidpoint] = useState<number | null>(null)
  const [initial, setInitial] = useState<number | null>(null)
  const throttleRef = useRef<{ last: number; pending: number | null }>({ last: 0, pending: null })

  useEffect(() => {
    if (!assetId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMidpoint(null)
      setInitial(null)
      return
    }

    setMidpoint(null)
    setInitial(null)
    throttleRef.current = { last: 0, pending: null }
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    /** Aggiorna midpoint a max 1 ogni THROTTLE_MS — flush trailing edge. */
    const apply = (v: number) => {
      if (cancelled) return
      const now = Date.now()
      const elapsed = now - throttleRef.current.last
      if (elapsed >= THROTTLE_MS) {
        throttleRef.current.last = now
        throttleRef.current.pending = null
        setMidpoint(v)
        setInitial((prev) => prev ?? v)
      } else {
        throttleRef.current.pending = v
        if (!timer) {
          timer = setTimeout(() => {
            timer = null
            const pending = throttleRef.current.pending
            if (pending !== null && !cancelled) {
              throttleRef.current.last = Date.now()
              throttleRef.current.pending = null
              setMidpoint(pending)
              setInitial((prev) => prev ?? pending)
            }
          }, THROTTLE_MS - elapsed)
        }
      }
    }

    // 1. Initial REST snapshot — popola subito invece di aspettare il primo evento
    fetch(`${CLOB_REST}/midpoint?token_id=${encodeURIComponent(assetId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { mid?: string | number } | null) => {
        if (cancelled || !data) return
        const v = typeof data.mid === 'string' ? parseFloat(data.mid) : Number(data.mid)
        if (Number.isFinite(v)) apply(v)
      })
      .catch(() => {
        /* WS prenderà il sopravvento */
      })

    // 2. WS book — midpoint dal top of book, throttled
    const unsubBook = subscribeToBook([assetId], (event) => {
      const bids = event.bids ?? event.buys
      const asks = event.asks ?? event.sells
      const topBid = topPrice(bids, 'desc')
      const topAsk = topPrice(asks, 'asc')
      if (topBid !== null && topAsk !== null) apply((topBid + topAsk) / 2)
    })

    // 3. WS price_change — prezzo trade confermato, throttled
    const unsubTrade = subscribeToPriceChange([assetId], (event) => {
      const price = parseFloat(event.price)
      if (Number.isFinite(price)) apply(price)
    })

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
      unsubBook()
      unsubTrade()
    }
  }, [assetId])

  const change =
    midpoint !== null && initial !== null && initial > 0
      ? ((midpoint - initial) / initial) * 100
      : null

  return { midpoint, change }
}

function topPrice(levels: PriceLevel[] | undefined, sort: 'asc' | 'desc'): number | null {
  if (!levels || levels.length === 0) return null
  const parsed = levels
    .map((l) => parseFloat(l.price))
    .filter((p): p is number => Number.isFinite(p) && p > 0 && p < 1)
  if (parsed.length === 0) return null
  return sort === 'desc' ? Math.max(...parsed) : Math.min(...parsed)
}
