'use client'

import { Plus, Check } from 'lucide-react'
import type { AuktoraEvent, AuktoraMarket } from '@/lib/polymarket/mappers'
import { useBetSlip, betSlipActions, BET_SLIP_LIMITS } from '@/lib/stores/useBetSlip'

interface Props {
  event: AuktoraEvent
  market: AuktoraMarket
  /** 'yes'/'no' per binary, label outcome per multi. */
  side: string
  outcomeLabel: string
  /** Prezzo attuale del side selezionato (0-1). */
  pricePerShare: number
  /** Token id del side. */
  tokenId: string
  /** Override colore tema. */
  size?: number
}

/**
 * "+" discreto su outcome card → aggiunge al Bet Slip drawer (Doc L2
 * Methods → postOrders batch). Doppio comportamento:
 *  - Se il leg (marketId, side) già nello slip → mostra ✓ + apre drawer
 *  - Altrimenti → aggiunge + apre drawer
 *
 * Il click NON propaga, così la card può comunque navigare a /event/[slug].
 */
export function BetSlipAddButton({
  event,
  market,
  side,
  outcomeLabel,
  pricePerShare,
  tokenId,
  size = 14,
}: Props) {
  const exists = useBetSlip((s) =>
    s.legs.some((l) => l.marketId === market.id && l.side === side.toLowerCase())
  )
  const totalLegs = useBetSlip((s) => s.legs.length)
  const atLimit = totalLegs >= BET_SLIP_LIMITS.MAX_LEGS && !exists
  const tradeDisabled = !market.enableOrderBook || !market.acceptingOrders || pricePerShare <= 0

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (tradeDisabled) return
    if (exists) {
      betSlipActions.open()
      return
    }
    if (atLimit) return
    betSlipActions.addLeg({
      marketId: market.id,
      eventId: event.id,
      slug: event.slug,
      title: event.title,
      cardKind: event.kind,
      category: event.tags[0] ?? 'general',
      outcomeLabel,
      side: side.toLowerCase(),
      pricePerShare,
      tokenId,
      clobTokenIds: market.clobTokenIds,
      conditionId: market.conditionId,
    })
  }

  const tooltip = tradeDisabled
    ? 'Mercato non tradabile'
    : exists
      ? 'Già nel Bet Slip — clicca per aprire'
      : atLimit
        ? `Bet Slip pieno (max ${BET_SLIP_LIMITS.MAX_LEGS} leg)`
        : `Aggiungi ${outcomeLabel} al Bet Slip`

  return (
    <button
      type="button"
      onClick={handleClick}
      title={tooltip}
      aria-label={tooltip}
      disabled={tradeDisabled || atLimit}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 22,
        height: 22,
        padding: 0,
        borderRadius: 'var(--radius-full)',
        background: exists
          ? 'color-mix(in srgb, var(--color-cta) 18%, transparent)'
          : 'var(--color-bg-tertiary)',
        border: `1px solid ${exists ? 'var(--color-cta)' : 'var(--color-border-subtle)'}`,
        color: exists ? 'var(--color-cta)' : 'var(--color-text-muted)',
        cursor: tradeDisabled || atLimit ? 'not-allowed' : 'pointer',
        opacity: tradeDisabled || atLimit ? 0.4 : 1,
        flexShrink: 0,
      }}
    >
      {exists ? <Check size={size - 2} /> : <Plus size={size - 2} />}
    </button>
  )
}
