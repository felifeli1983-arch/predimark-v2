'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2, Sparkles } from 'lucide-react'

import { useLiveMidpoint } from '@/lib/ws/hooks/useLiveMidpoint'

interface GammaTag {
  slug: string
}

interface GammaMarketLite {
  outcomes?: string
  outcomePrices?: string
  groupItemTitle?: string
  clobTokenIds?: string
}

interface GammaEventLite {
  id: string
  title: string
  slug: string
  image?: string
  icon?: string
  volume24hr?: number
  markets?: GammaMarketLite[]
  tags?: GammaTag[]
}

interface RelatedItem {
  id: string
  title: string
  slug: string
  image: string
  yesProb: number | null
  /** Yes token id per WS subscription live midpoint. */
  tokenId: string | null
  volume24h: number
}

function parseTokenId(raw: string | undefined): string | null {
  if (!raw) return null
  try {
    const arr = JSON.parse(raw) as unknown
    if (Array.isArray(arr) && typeof arr[0] === 'string') return arr[0]
  } catch {
    /* ignore */
  }
  return null
}

interface Props {
  /** Tag primario dell'evento corrente, usato come query Gamma. */
  primaryTag: string
  /** Event id corrente, escluso dai risultati. */
  excludeId: string
  /** Limite risultati (default 4). */
  limit?: number
}

function formatMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`
  return `$${n.toFixed(0)}`
}

function parsePrice(raw?: string): number | null {
  if (!raw) return null
  try {
    const arr = JSON.parse(raw) as unknown
    if (Array.isArray(arr) && arr.length >= 1) {
      const n = Number(arr[0])
      return Number.isFinite(n) ? n : null
    }
  } catch {
    /* ignore */
  }
  return null
}

/**
 * Sprint "Make Event Page Real" — mercati correlati live da Gamma API.
 * Sostituisce lo stub "disponibile in MA5" con dati reali.
 */
export function RelatedMarkets({ primaryTag, excludeId, limit = 4 }: Props) {
  const [items, setItems] = useState<RelatedItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // Gamma supporta filtro tag via tag slug
        const url = `https://gamma-api.polymarket.com/events?active=true&closed=false&limit=${limit + 4}&tag_slug=${encodeURIComponent(primaryTag)}&order=volume24hr&ascending=false`
        const res = await fetch(url, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as GammaEventLite[]
        if (cancelled) return
        const mapped: RelatedItem[] = (Array.isArray(data) ? data : [])
          .filter((e) => e.id !== excludeId)
          .slice(0, limit)
          .map((e) => {
            const m = e.markets?.[0]
            const yesProb = m ? parsePrice(m.outcomePrices) : null
            const tokenId = m ? parseTokenId(m.clobTokenIds) : null
            return {
              id: e.id,
              title: e.title,
              slug: e.slug,
              image: e.icon || e.image || '',
              yesProb,
              tokenId,
              volume24h: Number(e.volume24hr ?? 0),
            }
          })
        setItems(mapped)
        setError(null)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Errore')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [primaryTag, excludeId, limit])

  return (
    <section
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Sparkles size={14} style={{ color: 'var(--color-cta)' }} />
        <h3
          style={{
            margin: 0,
            fontSize: 'var(--font-sm)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Mercati correlati
        </h3>
      </div>

      {items === null && !error ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-3)' }}>
          <Loader2
            size={16}
            className="animate-spin"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </div>
      ) : error ? (
        <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
          Impossibile caricare i correlati ({error}).
        </p>
      ) : items && items.length === 0 ? (
        <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
          Nessun mercato correlato trovato per “{primaryTag}”.
        </p>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
          {items?.map((it) => (
            <li key={it.id}>
              <RelatedRow item={it} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/**
 * Riga singola correlata — subscribe live midpoint via WS.
 * Estratta come component separato così ogni riga ha il proprio
 * `useLiveMidpoint` hook (1 hook per row → N subscriptions aggregate
 * gestite dall'aggregator subscription-set in lib/ws/clob.ts).
 */
function RelatedRow({ item }: { item: RelatedItem }) {
  const { midpoint } = useLiveMidpoint(item.tokenId)
  const yesProb = midpoint ?? item.yesProb
  return (
    <Link
      href={`/event/${item.slug}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: 6,
        borderRadius: 'var(--radius-md)',
        textDecoration: 'none',
        color: 'var(--color-text-primary)',
        background: 'var(--color-bg-tertiary)',
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          flexShrink: 0,
          background: 'var(--color-bg-secondary)',
        }}
      >
        {item.image ? (
          <Image
            src={item.image}
            alt=""
            width={28}
            height={28}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : null}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--font-xs)',
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {item.title}
        </div>
        <div
          style={{
            fontSize: 9,
            color: 'var(--color-text-muted)',
            marginTop: 2,
            display: 'flex',
            gap: 6,
          }}
        >
          {yesProb !== null && (
            <span
              style={{
                color: 'var(--color-cta)',
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {(yesProb * 100).toFixed(0)}%
            </span>
          )}
          <span>· {formatMoney(item.volume24h)} 24h</span>
        </div>
      </div>
    </Link>
  )
}
