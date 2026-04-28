'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { AuktoraMarket } from '@/lib/polymarket/mappers'

interface Props {
  market: AuktoraMarket
  /** Override per multi-strike: true mostra "Currently" badge */
  highlighted?: boolean
  /** Label custom (es. groupItemTitle pulito); fallback a market.question */
  label?: string
  onTrade: (side: 'yes' | 'no') => void
}

export function OutcomeRowFull({ market, highlighted, label, onTrade }: Props) {
  const [expanded, setExpanded] = useState(false)
  const yesCents = Math.round(market.yesPrice * 100)
  const noCents = 100 - yesCents
  const pct = yesCents
  const displayLabel = label || market.groupItemTitle || market.question

  return (
    <div
      style={{
        background: 'var(--color-bg-secondary)',
        border: highlighted
          ? '1px solid var(--color-success)'
          : '1px solid var(--color-border-subtle)',
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="outcome-row"
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit',
          textAlign: 'left',
        }}
      >
        {/* Col 1 desktop / row 1 col 1 mobile: label + volume */}
        <span
          className="outcome-row__label"
          style={{
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            justifySelf: 'start',
            width: '100%',
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.25,
            }}
          >
            {displayLabel}
            {highlighted && <CurrentlyBadge />}
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.2 }}>
            ${(market.volume / 1_000).toFixed(1)}K Vol
          </span>
        </span>

        {/* Col 2 desktop / row 1 col 2 mobile: percentuale */}
        <span
          className="outcome-row__pct"
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            fontVariantNumeric: 'tabular-nums',
            textAlign: 'center',
            lineHeight: 1,
            justifySelf: 'center',
          }}
        >
          {pct}%
        </span>

        {/* Col 3 desktop / row 2 spans full mobile: buttons Sì/No */}
        <div className="outcome-row__btns" style={{ display: 'flex', gap: 8, justifySelf: 'end' }}>
          <SideBtn
            label={`Sì ${yesCents}¢`}
            variant="yes"
            onClick={(e) => {
              e.stopPropagation()
              onTrade('yes')
            }}
          />
          <SideBtn
            label={`No ${noCents}¢`}
            variant="no"
            onClick={(e) => {
              e.stopPropagation()
              onTrade('no')
            }}
          />
        </div>

        {/* Col 4 desktop / row 1 col 3 mobile: chevron expand */}
        <ChevronDown
          className="outcome-row__chevron"
          size={16}
          style={{
            color: 'var(--color-text-muted)',
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 150ms',
            justifySelf: 'end',
          }}
        />
      </button>

      {expanded && (
        <div
          style={{
            padding: '12px 14px',
            borderTop: '1px solid var(--color-border-subtle)',
            color: 'var(--color-text-muted)',
            fontSize: 12,
          }}
        >
          Libro ordini — disponibile in MA4
        </div>
      )}
    </div>
  )
}

function CurrentlyBadge() {
  return (
    <span
      style={{
        marginLeft: 8,
        padding: '1px 6px',
        borderRadius: 999,
        background: 'var(--color-success-bg)',
        color: 'var(--color-success)',
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
    >
      Currently
    </span>
  )
}

function SideBtn({
  label,
  variant,
  onClick,
}: {
  label: string
  variant: 'yes' | 'no'
  onClick: (e: React.MouseEvent) => void
}) {
  const isYes = variant === 'yes'
  return (
    <button
      type="button"
      className={`btn-trade ${isYes ? 'btn-trade-yes' : 'btn-trade-no'}`}
      onClick={(e) => {
        e.preventDefault()
        onClick(e)
      }}
      style={{
        padding: '12px 20px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: '0.02em',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        minWidth: 120,
      }}
    >
      {label}
    </button>
  )
}
