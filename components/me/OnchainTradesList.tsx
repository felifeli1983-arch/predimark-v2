'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { ExternalLink, Globe, Loader2 } from 'lucide-react'

interface OnchainTrade {
  proxyWallet: string
  conditionId: string
  asset: string
  side: 'BUY' | 'SELL'
  outcomeIndex: number
  size: number
  price: number
  transactionHash: string
  timestamp: number
}

interface Response {
  items: OnchainTrade[]
  meta: { count: number; address: string }
}

const POLYGONSCAN_TX = 'https://polygonscan.com/tx'

function formatSize(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toFixed(0)
}

/**
 * Lista trade on-chain dell'utente da Polymarket Data API.
 * Include TUTTI i trade fatti dall'address (Auktora + Polymarket
 * native UI), non solo quelli registrati nel nostro DB.
 *
 * Doc Polymarket "Quickstart": `getTrades()` SDK ritorna trade history
 * dal CLOB. Per noi serve il Data API `/activity?user=` perché vogliamo
 * trade già settled on-chain (più completo del CLOB live).
 */
export function OnchainTradesList() {
  const { getAccessToken } = usePrivy()
  const [trades, setTrades] = useState<OnchainTrade[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const res = await fetch('/api/v1/users/me/onchain-history?limit=100', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          const body = (await res.json()) as { error?: { message?: string } }
          throw new Error(body?.error?.message ?? `HTTP ${res.status}`)
        }
        const data = (await res.json()) as Response
        if (!cancelled) setTrades(data.items)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Errore')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [getAccessToken])

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          color: 'var(--color-text-muted)',
          gap: 6,
        }}
      >
        <Loader2 size={14} className="animate-spin" /> Caricamento trade on-chain…
      </div>
    )
  }

  if (error) {
    return (
      <p
        style={{
          padding: 16,
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-sm)',
        }}
      >
        {error}
      </p>
    )
  }

  if (!trades || trades.length === 0) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-sm)',
        }}
      >
        <Globe size={20} style={{ marginBottom: 8, opacity: 0.5 }} />
        <div>Nessun trade on-chain trovato per il tuo wallet.</div>
      </div>
    )
  }

  return (
    <ul
      style={{
        margin: 0,
        padding: 0,
        listStyle: 'none',
        display: 'grid',
        gap: 6,
      }}
    >
      {trades.map((t) => (
        <li
          key={`${t.transactionHash}-${t.asset}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <span
            style={{
              padding: '2px 7px',
              borderRadius: 'var(--radius-full)',
              background:
                t.side === 'BUY'
                  ? 'color-mix(in srgb, var(--color-success) 18%, transparent)'
                  : 'color-mix(in srgb, var(--color-danger) 18%, transparent)',
              color: t.side === 'BUY' ? 'var(--color-success)' : 'var(--color-danger)',
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.04em',
            }}
          >
            {t.side}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 'var(--font-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatSize(t.size)} @ {(t.price * 100).toFixed(2)}¢
            </div>
            <div
              style={{
                fontSize: 'var(--font-xs)',
                color: 'var(--color-text-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {new Date(t.timestamp * 1000).toLocaleString('it-IT', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
          <a
            href={`${POLYGONSCAN_TX}/${t.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Vedi tx su Polygonscan"
            style={{
              padding: 6,
              color: 'var(--color-text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <ExternalLink size={12} />
          </a>
        </li>
      ))}
    </ul>
  )
}
