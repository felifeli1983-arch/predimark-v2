'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { AuktoraEvent, AuktoraMarket } from '@/lib/polymarket/mappers'
import { useBatchPrices } from '@/lib/ws/hooks/useBatchPrices'
import { EventCardHeader } from '../EventCardHeader'
import { EventCardFooter } from '../EventCardFooter'
import { StarToggle } from '../StarToggle'
import { BetSlipAddButton } from '../BetSlipAddButton'

const TOP_N = 4
const REFRESH_INTERVAL_MS = 15_000

interface Props {
  event: AuktoraEvent
  onBookmark?: (eventId: string) => void
}

const STRIKE_RX = /\$?([\d,]+(?:\.\d+)?)\s*([kKmMbB])?/

/** Estrae il valore numerico della soglia da una label tipo "Bitcoin ≥ $130,000" / "100k" / "$1.5M" */
function extractStrike(label: string): number | null {
  if (!label) return null
  const m = label.match(STRIKE_RX)
  if (!m || !m[1]) return null
  const num = parseFloat(m[1].replace(/,/g, ''))
  if (!Number.isFinite(num)) return null
  const suffix = m[2]?.toLowerCase()
  if (suffix === 'k') return num * 1_000
  if (suffix === 'm') return num * 1_000_000
  if (suffix === 'b') return num * 1_000_000_000
  return num
}

/** Sort: per strike desc; se uno strike è null, fondo lista */
function compareStrikes(a: AuktoraMarket, b: AuktoraMarket): number {
  const sa = extractStrike(a.question)
  const sb = extractStrike(b.question)
  if (sa === null && sb === null) return 0
  if (sa === null) return 1
  if (sb === null) return -1
  return sb - sa
}

export function MultiStrikeCard({ event, onBookmark }: Props) {
  const router = useRouter()

  // Live midpoint batch via CLOB /prices — fetch prezzi di tutti gli
  // strike in 1 request, polling 15s. Sostituisce fetchEventById.
  const yesTokenIds = useMemo(
    () =>
      event.markets
        .map((m) => m.clobTokenIds?.[0])
        .filter((t): t is string => typeof t === 'string'),
    [event.markets]
  )
  const livePrices = useBatchPrices(yesTokenIds, REFRESH_INTERVAL_MS)

  const sorted = useMemo(() => {
    return [...event.markets]
      .map((m): AuktoraMarket => {
        const live = m.clobTokenIds?.[0] ? livePrices[m.clobTokenIds[0]] : undefined
        return live !== undefined ? { ...m, yesPrice: live, noPrice: 1 - live } : m
      })
      .sort(compareStrikes)
  }, [event.markets, livePrices])
  const top = sorted.slice(0, TOP_N)
  const remaining = sorted.length - top.length

  // Soglia "corrente": la più alta con prob > 50%
  const currentIndex = top.findIndex((m) => m.yesPrice > 0.5)

  function navigateToEvent(marketId: string, side: 'yes' | 'no') {
    router.push(`/event/${event.slug}?market=${marketId}&side=${side}`)
  }

  return (
    <div className="flex flex-col" style={{ flex: 1 }}>
      <EventCardHeader
        title={event.title}
        image={event.image}
        tags={event.tags}
        onBookmark={onBookmark ? () => onBookmark(event.id) : undefined}
      />

      <div style={{ padding: '4px 12px 8px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {top.map((m, i) => (
          <StrikeRow
            key={m.id}
            market={m}
            event={event}
            highlighted={i === currentIndex}
            onYesClick={() => navigateToEvent(m.id, 'yes')}
            onNoClick={() => navigateToEvent(m.id, 'no')}
          />
        ))}
        {remaining > 0 && (
          <div
            style={{
              padding: '6px 0 2px',
              textAlign: 'center',
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            + {remaining} altri →
          </div>
        )}
      </div>

      <EventCardFooter volume={event.totalVolume} endDate={event.endDate} />
    </div>
  )
}

interface RowProps {
  market: AuktoraMarket
  event: AuktoraEvent
  highlighted: boolean
  onYesClick: () => void
  onNoClick: () => void
}

function StrikeRow({ market, event, highlighted, onYesClick, onNoClick }: RowProps) {
  const pct = Math.round(market.yesPrice * 100)
  const labelColor = highlighted ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 0',
      }}
    >
      <StarToggle
        payload={{
          polymarketMarketId: market.id,
          polymarketEventId: event.id,
          slug: event.slug,
          title: `${event.title} — ${market.question}`,
          cardKind: event.kind,
          category: event.tags[0] ?? 'general',
          image: event.image,
          currentYesPrice: market.yesPrice,
        }}
        marketLabel={market.question}
        size={12}
      />
      <span
        style={{
          flex: 1,
          fontSize: 'var(--font-sm)',
          color: labelColor,
          fontWeight: highlighted ? 600 : 400,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
        }}
      >
        {market.question}
      </span>
      <span
        style={{
          fontSize: 'var(--font-sm)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          minWidth: 32,
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          flexShrink: 0,
        }}
      >
        {pct}%
      </span>
      <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }}>
        <SideBtn label="Sì" variant="yes" onClick={onYesClick} />
        <BetSlipAddButton
          event={event}
          market={market}
          side="yes"
          outcomeLabel={`Sì · ${market.question}`}
          pricePerShare={market.yesPrice}
          tokenId={market.clobTokenIds?.[0] ?? ''}
          size={11}
        />
        <SideBtn label="No" variant="no" onClick={onNoClick} />
        <BetSlipAddButton
          event={event}
          market={market}
          side="no"
          outcomeLabel={`No · ${market.question}`}
          pricePerShare={market.noPrice}
          tokenId={market.clobTokenIds?.[1] ?? ''}
          size={11}
        />
      </div>
    </div>
  )
}

function SideBtn({
  label,
  variant,
  onClick,
}: {
  label: string
  variant: 'yes' | 'no'
  onClick: () => void
}) {
  const isYes = variant === 'yes'
  return (
    <button
      type="button"
      className={`btn-trade ${isYes ? 'btn-trade-yes' : 'btn-trade-no'}`}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      style={{
        padding: '3px 8px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--font-xs)',
        fontWeight: 700,
        letterSpacing: '0.04em',
      }}
    >
      {label}
    </button>
  )
}
