'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { PositionItem } from '@/lib/api/positions-client'

interface Props {
  position: PositionItem
  onSell: () => void
}

export function PositionRow({ position, onSell }: Props) {
  const sideUpper = position.side.toUpperCase()
  const isYes = position.side.toLowerCase() === 'yes'
  const sideColor = isYes ? 'var(--color-success)' : 'var(--color-danger)'

  const pnl = position.unrealizedPnl
  const pnlPct = position.unrealizedPnlPct
  const pnlColor =
    pnl === null || pnl === 0
      ? 'var(--color-text-muted)'
      : pnl > 0
        ? 'var(--color-success)'
        : 'var(--color-danger)'
  const pnlSign = pnl !== null && pnl > 0 ? '+' : ''

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'var(--color-bg-tertiary)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-secondary)',
          fontWeight: 700,
        }}
      >
        {position.image ? (
          <Image
            src={position.image}
            alt=""
            width={40}
            height={40}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          (position.title?.[0]?.toUpperCase() ?? '?')
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span
            style={{
              fontSize: 'var(--font-xs)',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              background: 'color-mix(in srgb, transparent 80%, currentColor)',
              color: sideColor,
              flexShrink: 0,
              letterSpacing: '0.04em',
            }}
          >
            {sideUpper}
          </span>
          <div
            style={{
              fontSize: 'var(--font-base)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 0,
            }}
          >
            {position.slug ? (
              <Link
                href={`/event/${position.slug}`}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                {position.title}
              </Link>
            ) : (
              position.title
            )}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 12,
            fontSize: 'var(--font-xs)',
            color: 'var(--color-text-muted)',
            fontVariantNumeric: 'tabular-nums',
            flexWrap: 'wrap',
          }}
        >
          <span>{position.shares.toFixed(2)} shares</span>
          <span>avg ${position.avgPrice.toFixed(3)}</span>
          {position.currentPrice !== null && <span>now ${position.currentPrice.toFixed(3)}</span>}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 2,
          flexShrink: 0,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        <span
          style={{
            fontSize: 'var(--font-base)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          {position.currentValue !== null ? `$${position.currentValue.toFixed(2)}` : '—'}
        </span>
        {pnl !== null && (
          <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600, color: pnlColor }}>
            {pnlSign}${pnl.toFixed(2)}
            {pnlPct !== null && ` (${pnlSign}${pnlPct.toFixed(1)}%)`}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onSell}
        style={{
          background: 'var(--color-cta)',
          color: '#fff',
          border: 'none',
          padding: '8px 14px',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-sm)',
          fontWeight: 600,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Sell
      </button>
    </div>
  )
}
