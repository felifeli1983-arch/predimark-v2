'use client'

import { X } from 'lucide-react'
import { legPayout, type SlipLeg } from '@/lib/stores/useBetSlip'

interface Props {
  leg: SlipLeg
  onRemove: (id: string) => void
  onStakeChange: (id: string, stake: number) => void
}

export function SlipLegRow({ leg, onRemove, onStakeChange }: Props) {
  const payout = legPayout(leg)
  const profit = payout - leg.stake
  const hasError = Boolean(leg.errorAtPlace)

  return (
    <div
      style={{
        background: hasError ? 'var(--color-danger-bg)' : 'var(--color-bg-tertiary)',
        border: hasError ? '1px solid var(--color-danger)' : '1px solid var(--color-border-subtle)',
        borderRadius: 10,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {leg.marketTitle}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 2,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--color-cta)',
                background: 'var(--color-cta-bg)',
                padding: '2px 6px',
                borderRadius: 4,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {leg.outcomeLabel}
            </span>
            <span
              style={{
                fontSize: 11,
                color: 'var(--color-text-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {Math.round(leg.priceAtAdd * 100)}¢
            </span>
          </div>
        </div>

        <button
          type="button"
          aria-label="Rimuovi leg"
          onClick={() => onRemove(leg.id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={14} />
        </button>
      </div>

      {hasError && (
        <p
          style={{
            margin: 0,
            fontSize: 11,
            color: 'var(--color-danger)',
            fontWeight: 600,
          }}
        >
          {leg.errorAtPlace}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            flex: 1,
          }}
        >
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Stake (USDC)</span>
          <input
            type="number"
            min={1}
            max={10000}
            step={1}
            value={leg.stake}
            onChange={(e) => onStakeChange(leg.id, Number(e.target.value))}
            style={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 6,
              padding: '6px 8px',
              fontSize: 13,
              color: 'var(--color-text-primary)',
              fontVariantNumeric: 'tabular-nums',
              width: '100%',
              outline: 'none',
            }}
          />
        </label>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'flex-end',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>Payout</span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--color-success)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            ${payout.toFixed(2)}
          </span>
          <span
            style={{
              fontSize: 10,
              color: 'var(--color-text-muted)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            +${profit.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
