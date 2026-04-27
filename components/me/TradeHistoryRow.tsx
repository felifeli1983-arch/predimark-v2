'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { TradeHistoryItem } from '@/lib/api/positions-client'

interface Props {
  trade: TradeHistoryItem
}

const TYPE_LABEL: Record<string, string> = {
  open: 'Apertura',
  close: 'Vendita',
  resolution: 'Risoluzione',
}

export function TradeHistoryRow({ trade }: Props) {
  const isYes = trade.side.toLowerCase() === 'yes'
  const sideColor = isYes ? 'var(--color-success)' : 'var(--color-danger)'
  const sideUpper = trade.side.toUpperCase()
  const typeLabel = TYPE_LABEL[trade.tradeType] ?? trade.tradeType

  const showPnl = trade.tradeType !== 'open' && trade.pnl !== null
  const pnlColor =
    !showPnl || trade.pnl === null
      ? 'var(--color-text-muted)'
      : trade.pnl > 0
        ? 'var(--color-success)'
        : trade.pnl < 0
          ? 'var(--color-danger)'
          : 'var(--color-text-muted)'
  const pnlSign = trade.pnl !== null && trade.pnl > 0 ? '+' : ''

  const dateLabel = trade.executedAt
    ? new Date(trade.executedAt).toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

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
          width: 36,
          height: 36,
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
        {trade.image ? (
          <Image src={trade.image} alt="" width={36} height={36} style={{ objectFit: 'cover' }} />
        ) : (
          (trade.title?.[0]?.toUpperCase() ?? '?')
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              padding: '2px 5px',
              borderRadius: 3,
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)',
              flexShrink: 0,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {typeLabel}
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              padding: '2px 5px',
              borderRadius: 3,
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
            {trade.slug ? (
              <Link
                href={`/event/${trade.slug}`}
                style={{ color: 'inherit', textDecoration: 'none' }}
              >
                {trade.title}
              </Link>
            ) : (
              trade.title
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
          <span>{trade.shares.toFixed(2)} sh</span>
          <span>${trade.price.toFixed(3)}</span>
          <span>{dateLabel}</span>
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
          ${trade.totalAmount.toFixed(2)}
        </span>
        {showPnl && trade.pnl !== null && (
          <span style={{ fontSize: 11, fontWeight: 600, color: pnlColor }}>
            {pnlSign}${trade.pnl.toFixed(2)}
            {trade.pnlPct !== null && ` (${pnlSign}${trade.pnlPct.toFixed(1)}%)`}
          </span>
        )}
      </div>
    </div>
  )
}
