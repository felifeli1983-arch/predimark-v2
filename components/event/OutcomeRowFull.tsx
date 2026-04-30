'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { AuktoraMarket } from '@/lib/polymarket/mappers'
import { OrderBookPanel } from './OrderBookPanel'

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
  // Tradability: market on-chain ma con CLOB disabilitato O non più
  // accettando ordini (es. sport post-kickoff) → disabilita bottoni.
  const tradeDisabled = !market.enableOrderBook || !market.acceptingOrders
  const disabledReason = !market.enableOrderBook
    ? 'Mercato non disponibile per trading CLOB'
    : 'Ordini sospesi (es. partita iniziata)'

  return (
    <div
      style={{
        background: 'var(--color-bg-secondary)',
        border: highlighted
          ? '1px solid var(--color-success)'
          : '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setExpanded((v) => !v)
          }
        }}
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
              fontSize: 'var(--font-md)',
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
          <span
            style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-muted)',
              lineHeight: 1.2,
            }}
          >
            ${(market.volume / 1_000).toFixed(1)}K Vol
          </span>
        </span>

        {/* Col 2 desktop / row 1 col 2 mobile: percentuale */}
        <span
          className="outcome-row__pct"
          style={{
            fontSize: 'var(--font-2xl)',
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
            disabled={tradeDisabled}
            disabledReason={disabledReason}
            onClick={(e) => {
              e.stopPropagation()
              onTrade('yes')
            }}
          />
          <SideBtn
            label={`No ${noCents}¢`}
            variant="no"
            disabled={tradeDisabled}
            disabledReason={disabledReason}
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
      </div>

      {expanded && (
        <div
          style={{
            borderTop: '1px solid var(--color-border-subtle)',
          }}
        >
          <OrderBookPanel assetId={market.clobTokenIds?.[0] ?? null} />
        </div>
      )}
    </div>
  )
}

function CurrentlyBadge() {
  return (
    <span
      style={{
        marginLeft: 'var(--space-2)',
        padding: '1px var(--space-2)',
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-success-bg)',
        color: 'var(--color-success)',
        fontSize: 'var(--font-xs)',
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
  disabled,
  disabledReason,
}: {
  label: string
  variant: 'yes' | 'no'
  onClick: (e: React.MouseEvent) => void
  disabled?: boolean
  disabledReason?: string
}) {
  const isYes = variant === 'yes'
  return (
    <button
      type="button"
      className={`btn-trade ${isYes ? 'btn-trade-yes' : 'btn-trade-no'}`}
      onClick={(e) => {
        e.preventDefault()
        if (!disabled) onClick(e)
      }}
      disabled={disabled}
      title={disabled ? disabledReason : undefined}
      style={{
        padding: 'var(--space-3) var(--space-5)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-md)',
        fontWeight: 700,
        letterSpacing: '0.02em',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        minWidth: 120,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  )
}
