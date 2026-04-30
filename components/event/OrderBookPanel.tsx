'use client'

import { useEffect, useState } from 'react'
import { useLiveOrderbook } from '@/lib/ws/hooks/useLiveOrderbook'

interface Props {
  /** YES asset id (clobTokenIds[0]). Se null, panel mostra empty state. */
  assetId: string | null
}

/**
 * Polymarket /spread endpoint — official spread aggiornato 5s.
 * Più accurato del calcolo client-side dalla nostra orderbook snapshot
 * (top-5 levels) perché Polymarket usa il book completo per il best.
 */
function useOfficialSpread(assetId: string | null): number | null {
  const [spread, setSpread] = useState<number | null>(null)
  useEffect(() => {
    if (!assetId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSpread(null)
      return
    }
    let cancelled = false
    async function refresh() {
      try {
        const url = new URL('/spread', 'https://clob.polymarket.com')
        url.searchParams.set('token_id', assetId!)
        const res = await fetch(url.toString())
        if (!res.ok) return
        const data = (await res.json()) as { spread?: string | number }
        const v =
          typeof data?.spread === 'string' ? Number(data.spread) : (data?.spread ?? NaN)
        if (!cancelled && Number.isFinite(v)) setSpread(v)
      } catch {
        /* fallback: client-side calc dal book */
      }
    }
    void refresh()
    const id = setInterval(refresh, 5_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [assetId])
  return spread
}

/**
 * Sprint 3.5.5 — Order book accordion.
 * Wired a useLiveOrderbook (WebSocket Polymarket CLOB).
 * Mostra top 5 bids + top 5 asks con depth chart visual (bar width = size%).
 */
export function OrderBookPanel({ assetId }: Props) {
  const book = useLiveOrderbook(assetId)
  const officialSpread = useOfficialSpread(assetId)
  // Polymarket book API: bids ordinati ASC (peggio→meglio) e asks DESC
  // (peggio→meglio). Il BEST level è sempre l'ultimo (index -1) dell'array.
  // slice(0, 5) prendeva i 5 PEGGIORI → spread fittizio enorme (es. 98¢ su
  // market a 34%). Fix: slice(-5) per i 5 migliori, poi reverse i bids per
  // mostrare best in alto vicino al divider spread.
  const topAsks = book.asks.slice(-5) // [worst-of-5, ..., best] — best in basso
  const topBids = book.bids.slice(-5).reverse() // [best, ..., worst-of-5] — best in alto

  if (!assetId) {
    return (
      <div
        style={{
          padding: 'var(--space-3)',
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
        }}
      >
        Asset ID non disponibile per questo market.
      </div>
    )
  }

  if (book.bids.length === 0 && book.asks.length === 0) {
    return (
      <div
        style={{
          padding: 'var(--space-3)',
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
        }}
      >
        Caricamento orderbook live...
      </div>
    )
  }

  // Calcola size massimo per scaling depth bars
  const maxSize = Math.max(...topBids.map((b) => b.size), ...topAsks.map((a) => a.size), 1)

  return (
    <div
      style={{
        padding: 'var(--space-2) var(--space-3)',
        fontSize: 'var(--font-xs)',
        fontFamily: 'monospace',
        fontVariantNumeric: 'tabular-nums',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: 'var(--color-text-muted)',
        }}
      >
        <span>Price (¢)</span>
        <span>Size</span>
      </div>

      {/* ASKS (sells) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {topAsks.length === 0 ? (
          <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 4 }}>
            no asks
          </div>
        ) : (
          topAsks.map((a, i) => (
            <DepthBar
              key={`ask-${i}`}
              price={a.price}
              size={a.size}
              maxSize={maxSize}
              color="var(--color-danger)"
              align="right"
            />
          ))
        )}
      </div>

      {/* Spread divider */}
      <div
        style={{
          padding: '4px 0',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          borderTop: '1px dashed var(--color-border-subtle)',
          borderBottom: '1px dashed var(--color-border-subtle)',
        }}
      >
        {/* Spread official Polymarket /spread se disponibile, altrimenti
            calcolo client-side dal book top-5. */}
        {officialSpread !== null
          ? `Spread ${(officialSpread * 100).toFixed(2)}¢`
          : topAsks.length > 0 && topBids.length > 0
            ? `Spread ${(((topAsks[topAsks.length - 1]?.price ?? 0) - (topBids[0]?.price ?? 0)) * 100).toFixed(2)}¢`
            : '—'}
      </div>

      {/* BIDS (buys) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {topBids.length === 0 ? (
          <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 4 }}>
            no bids
          </div>
        ) : (
          topBids.map((b, i) => (
            <DepthBar
              key={`bid-${i}`}
              price={b.price}
              size={b.size}
              maxSize={maxSize}
              color="var(--color-success)"
              align="left"
            />
          ))
        )}
      </div>
    </div>
  )
}

function DepthBar({
  price,
  size,
  maxSize,
  color,
  align,
}: {
  price: number
  size: number
  maxSize: number
  color: string
  align: 'left' | 'right'
}) {
  const width = (size / maxSize) * 100
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '2px 4px',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          [align]: 0,
          width: `${width}%`,
          height: '100%',
          background: `color-mix(in srgb, ${color} 20%, transparent)`,
          zIndex: 0,
        }}
      />
      <span style={{ position: 'relative', zIndex: 1, color }}>{(price * 100).toFixed(2)}</span>
      <span style={{ position: 'relative', zIndex: 1, color: 'var(--color-text-secondary)' }}>
        {size.toLocaleString('en-US', { maximumFractionDigits: 0 })}
      </span>
    </div>
  )
}
