'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface RoundItem {
  slug: string
  endDate: string
  resolution: 'yes' | 'no' | 'active' | 'pending'
}

interface Props {
  seriesSlug: string
  currentSlug: string
}

const DOT_COLOR: Record<RoundItem['resolution'], string> = {
  yes: 'var(--color-success)',
  no: 'var(--color-danger)',
  active: 'var(--color-text-muted)',
  pending: 'var(--color-bg-tertiary)',
}

function formatRoundTime(endDate: string): string {
  const d = new Date(endDate)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

/**
 * Sprint 3.5.6 — Striscia round navigation per eventi crypto_up_down.
 * Mostra pallini colorati (verde=Up vinto, rosso=Down, grigio=live, opaco=futuro)
 * con orari cliccabili per navigare ai round storici.
 */
export function CryptoRoundNav({ seriesSlug, currentSlug }: Props) {
  const router = useRouter()
  const [rounds, setRounds] = useState<RoundItem[]>([])

  useEffect(() => {
    if (!seriesSlug) return
    fetch(`/api/v1/crypto/rounds?seriesSlug=${encodeURIComponent(seriesSlug)}&limit=15`)
      .then((r) => r.json())
      .then((data: { items?: RoundItem[] }) => {
        const sorted = [...(data.items ?? [])].sort(
          (a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
        )
        setRounds(sorted)
      })
      .catch(() => {
        /* silenzioso — round nav non bloccante */
      })
  }, [seriesSlug])

  if (rounds.length === 0) return null

  return (
    <div
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-3)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      <span
        style={{
          fontSize: 'var(--font-xs)',
          fontWeight: 700,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        Round recenti
      </span>

      <div
        style={
          {
            display: 'flex',
            gap: 'var(--space-3)',
            overflowX: 'auto',
            paddingBottom: 4,
            // Nasconde scrollbar su tutti i browser
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          } as React.CSSProperties
        }
      >
        {rounds.map((round) => {
          const isCurrent = round.slug === currentSlug
          const isActive = round.resolution === 'active'
          const isPending = round.resolution === 'pending'

          return (
            <button
              key={round.slug}
              type="button"
              onClick={() => {
                if (!isCurrent && !isPending) router.push(`/event/${round.slug}`)
              }}
              disabled={isPending}
              title={round.slug}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                flexShrink: 0,
                cursor: isCurrent || isPending ? 'default' : 'pointer',
                opacity: isPending ? 0.35 : 1,
                background: isCurrent ? 'var(--color-bg-tertiary)' : 'none',
                border: isCurrent
                  ? '1px solid var(--color-border-subtle)'
                  : '1px solid transparent',
                borderRadius: 'var(--radius-sm)',
                padding: '4px 6px',
                transition: 'background 120ms',
              }}
            >
              {/* Pallino esito */}
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: DOT_COLOR[round.resolution],
                  display: 'block',
                  flexShrink: 0,
                  animation: isActive ? 'pulse 1.5s ease-in-out infinite' : 'none',
                }}
              />
              {/* Orario fine round */}
              <span
                style={{
                  fontSize: 9,
                  color: isCurrent ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  fontWeight: isCurrent ? 700 : 400,
                  fontVariantNumeric: 'tabular-nums',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatRoundTime(round.endDate)}
              </span>
              {isCurrent && (
                <span
                  style={{
                    fontSize: 8,
                    color: 'var(--color-cta)',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    lineHeight: 1,
                  }}
                >
                  LIVE
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
