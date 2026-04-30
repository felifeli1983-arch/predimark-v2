'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, ExternalLink, Loader2, Users } from 'lucide-react'

import type { Holder } from '@/lib/polymarket/data-api'

interface Props {
  conditionId: string | null
  /** Etichette outcome (es. ["Yes","No"] o ["Up","Down"]). */
  outcomes?: string[]
}

interface HoldersByToken {
  token: string
  holders: Holder[]
}

interface HoldersResponse {
  items: HoldersByToken[]
}

/**
 * Top holders per outcome di un market — fetch dal Data API Polymarket.
 * Doc "Overview" market data: `GET /holders?market=<conditionId>&limit=N`.
 *
 * Per binary markets ritorna 2 gruppi (Yes/No), ciascuno con array di
 * holders ordinati per `amount` desc. Mostriamo top 5 per outcome.
 */
const POLYGONSCAN_ADDR = 'https://polygonscan.com/address'

export function EventHolders({ conditionId, outcomes = ['Yes', 'No'] }: Props) {
  const [groups, setGroups] = useState<HoldersByToken[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!conditionId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(
          `/api/v1/markets/${encodeURIComponent(conditionId)}/holders?limit=10`
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as HoldersResponse
        if (!cancelled) setGroups(data.items ?? [])
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Errore')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [conditionId])

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-sm)',
          gap: 6,
        }}
      >
        <Loader2 size={14} className="animate-spin" /> Caricamento holders…
      </div>
    )
  }

  if (error) {
    return (
      <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--font-sm)' }}>
        Errore caricamento holders: {error}
      </p>
    )
  }

  if (groups.length === 0 || groups.every((g) => g.holders.length === 0)) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: 16,
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-sm)',
          textAlign: 'center',
          justifyContent: 'center',
        }}
      >
        <Users size={14} />
        Nessun holder ancora registrato per questo market.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {groups.map((group) => {
        const outcomeLabel = outcomes[group.holders[0]?.outcomeIndex ?? 0] ?? 'Outcome'
        const accent =
          group.holders[0]?.outcomeIndex === 0
            ? 'var(--color-success)'
            : 'var(--color-danger)'
        return (
          <div key={group.token}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  padding: '2px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'color-mix(in srgb, ' + accent + ' 18%, transparent)',
                  color: accent,
                  fontSize: 'var(--font-xs)',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {outcomeLabel}
              </span>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                Top {Math.min(5, group.holders.length)} holders
              </span>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 4 }}>
              {group.holders.slice(0, 5).map((h, i) => (
                <li key={h.proxyWallet}>
                  <HolderRow rank={i + 1} holder={h} />
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function HolderRow({ rank, holder }: { rank: number; holder: Holder }) {
  const display = holder.name?.trim() || holder.pseudonym || 'Anonymous'
  const shortAddr = `${holder.proxyWallet.slice(0, 6)}…${holder.proxyWallet.slice(-4)}`
  return (
    <a
      href={`${POLYGONSCAN_ADDR}/${holder.proxyWallet}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-sm)',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <span
        style={{
          width: 22,
          textAlign: 'center',
          fontSize: 'var(--font-xs)',
          fontWeight: 700,
          color: 'var(--color-text-muted)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        #{rank}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 'var(--font-sm)',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          <span
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 180,
            }}
          >
            {display}
          </span>
          {holder.verified && (
            <CheckCircle2 size={12} style={{ color: 'var(--color-cta)', flexShrink: 0 }} />
          )}
        </div>
        <div
          style={{
            fontSize: 'var(--font-xs)',
            color: 'var(--color-text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {shortAddr}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div
          style={{
            fontSize: 'var(--font-sm)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {holder.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
        <div
          style={{
            fontSize: 'var(--font-xs)',
            color: 'var(--color-text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          tokens <ExternalLink size={9} />
        </div>
      </div>
    </a>
  )
}
