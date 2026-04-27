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
        borderRadius: 10,
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
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: 4,
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
              fontSize: 13,
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
            fontSize: 11,
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
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {position.currentValue !== null ? `$${position.currentValue.toFixed(2)}` : '—'}
        </span>
        {pnl !== null && (
          <span style={{ fontSize: 11, fontWeight: 600, color: pnlColor }}>
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
          borderRadius: 6,
          fontSize: 12,
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
