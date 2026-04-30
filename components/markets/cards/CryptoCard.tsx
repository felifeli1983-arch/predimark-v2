'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, TrendingUp, TrendingDown } from 'lucide-react'
import { mapGammaEvent, type AuktoraEvent } from '@/lib/polymarket/mappers'
import { fetchEventById, fetchNextRoundInSeries } from '@/lib/polymarket/queries'
import { useCountdown } from '@/lib/hooks/useCountdown'
import { useCryptoLivePrice } from '@/lib/ws/hooks/useCryptoLivePrice'
import { useLiveMidpoint } from '@/lib/ws/hooks/useLiveMidpoint'
import { EventCardHeader } from '../EventCardHeader'
import { StarToggle } from '../StarToggle'

interface Props {
  event: AuktoraEvent
  onBookmark?: (eventId: string) => void
}

const SHORT_ROUND_MS = 30 * 60 * 1000 // ≤30min → Chainlink, oltre → Binance
const REFRESH_INTERVAL_MS = 30_000
const URGENT_COUNTDOWN_S = 30 // <30s → countdown rosso pulsante
const WARN_COUNTDOWN_S = 120 // <2min → warning ambra
const NEXT_ROUND_POLL_MS = 5_000 // 5s polling quando expired finché next round arriva

const SYMBOL_HINTS: Array<[RegExp, string]> = [
  [/\b(btc|bitcoin)\b/i, 'btcusdt'],
  [/\b(eth|ethereum)\b/i, 'ethusdt'],
  [/\b(sol|solana)\b/i, 'solusdt'],
]

function extractSymbol(slug: string, title: string): string | null {
  const text = `${slug} ${title}`.toLowerCase()
  for (const [rx, symbol] of SYMBOL_HINTS) {
    if (rx.test(text)) return symbol
  }
  return null
}

function formatUsd(n: number | null, decimals: number = 2): string {
  if (n === null || !Number.isFinite(n)) return '—'
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

/**
 * Crypto round card — design pulito, niente Thermometer/Battere/volume.
 * Layout (260px height fissa, come tutte le card):
 *  - Header standard (icon + title + LIVE + star)
 *  - Body: live price compatto + probability bar Up/Down + 2 buttons
 *  - Footer custom: countdown prominente con colore adattivo (verde→ambra→rosso)
 */
export function CryptoCard({ event: initialEvent, onBookmark }: Props) {
  const [event, setEvent] = useState(initialEvent)
  const router = useRouter()
  const market = event.markets[0]
  const symbol = extractSymbol(event.slug, event.title)

  const source = useMemo<'chainlink' | 'binance'>(() => {
    // eslint-disable-next-line react-hooks/purity
    const remainingMs = event.endDate.getTime() - Date.now()
    return remainingMs > 0 && remainingMs <= SHORT_ROUND_MS ? 'chainlink' : 'binance'
  }, [event.endDate])

  const { price: livePrice, change24h } = useCryptoLivePrice(symbol ?? '', source)
  const { midpoint: upMidpoint } = useLiveMidpoint(market?.clobTokenIds?.[0] ?? null)
  const { display: countdownText, expired, secondsLeft } = useCountdown(event.endDate)

  const upProb = upMidpoint ?? market?.yesPrice ?? 0.5
  const downProb = 1 - upProb
  const upPct = Math.round(upProb * 100)
  const downPct = Math.round(downProb * 100)

  // Polling refresh dello STESSO round mentre è attivo — cattura
  // closed=true / acceptingOrders=false / lastTradePrice changes che il
  // WS non sempre propaga. Si ferma quando expired (vedi useEffect sotto
  // per la transition al next round).
  useEffect(() => {
    if (expired) return
    const id = setInterval(async () => {
      try {
        const fresh = await fetchEventById(event.id)
        if (fresh) setEvent(mapGammaEvent(fresh))
      } catch {
        // silenzioso: WS continua a funzionare anche se polling fallisce
      }
    }, REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  }, [event.id, expired])

  // Auto-transition al PROSSIMO round della stessa serie quando il countdown
  // arriva a zero. Polling 5s perché Polymarket pubblica il next round con
  // qualche secondo di ritardo dopo la chiusura del precedente.
  // Pattern 1 di refresh — Doc 4 page-1: "card cambia identità all'occorrenza
  // successiva quando si risolve". Solo per crypto round (seriesSlug
  // contiene 'up-or-down'), non per ogni evento expired.
  useEffect(() => {
    if (!expired || !event.seriesSlug) return
    if (!event.seriesSlug.includes('up-or-down')) return
    let cancelled = false
    const tryNext = async () => {
      const next = await fetchNextRoundInSeries(event.seriesSlug!)
      if (!cancelled && next && next.id !== event.id) {
        setEvent(mapGammaEvent(next))
      }
    }
    tryNext()
    const id = setInterval(tryNext, NEXT_ROUND_POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [expired, event.seriesSlug, event.id])

  const isLive = !expired && event.active

  // Countdown urgency: <30s rosso pulsante, <2min ambra, altrimenti muted.
  // Usa `secondsLeft` dal hook (già stateful) invece di Date.now() impuro.
  const countdownColor = expired
    ? 'var(--color-text-muted)'
    : secondsLeft < URGENT_COUNTDOWN_S
      ? 'var(--color-danger)'
      : secondsLeft < WARN_COUNTDOWN_S
        ? 'var(--color-warning)'
        : 'var(--color-text-secondary)'
  const countdownPulse = !expired && secondsLeft < URGENT_COUNTDOWN_S

  function navigateToEvent(side: 'up' | 'down') {
    if (!market) return
    router.push(`/event/${event.slug}?market=${market.id}&side=${side}`)
  }

  return (
    <div className="flex flex-col" style={{ flex: 1 }}>
      <EventCardHeader
        title={event.title}
        image={event.image}
        tags={event.tags}
        isLive={isLive}
        onBookmark={onBookmark ? () => onBookmark(event.id) : undefined}
        starSlot={
          market ? (
            <StarToggle
              payload={{
                polymarketMarketId: market.id,
                polymarketEventId: event.id,
                slug: event.slug,
                title: event.title,
                cardKind: event.kind,
                category: event.tags[0] ?? 'general',
                image: event.image,
                currentYesPrice: market.yesPrice,
              }}
              marketLabel={event.title}
            />
          ) : undefined
        }
      />

      <div
        style={{
          padding: '4px 12px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          justifyContent: 'space-between',
        }}
      >
        {/* Live price + delta 24h (compatto, riga unica) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 6,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <span
            style={{
              fontSize: 'var(--font-lg)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              lineHeight: 1,
            }}
          >
            {livePrice !== null ? formatUsd(livePrice, livePrice >= 1000 ? 0 : 2) : '—'}
          </span>
          {change24h !== null && Number.isFinite(change24h) && (
            <span
              style={{
                fontSize: 'var(--font-xs)',
                fontWeight: 600,
                color: change24h >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
              }}
            >
              {change24h >= 0 ? '↗' : '↘'} {change24h >= 0 ? '+' : ''}
              {change24h.toFixed(2)}%
            </span>
          )}
        </div>

        {/* Probability bar Up/Down + Up/Down buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              display: 'flex',
              height: 4,
              borderRadius: 2,
              overflow: 'hidden',
              background: 'var(--color-bg-tertiary)',
            }}
          >
            <div
              style={{
                width: `${upPct}%`,
                background: 'var(--color-success)',
                transition: 'width 200ms',
              }}
            />
            <div
              style={{
                width: `${downPct}%`,
                background: 'var(--color-danger)',
                transition: 'width 200ms',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className="btn-trade btn-trade-up"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                navigateToEvent('up')
              }}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-base)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                cursor: 'pointer',
              }}
            >
              <TrendingUp size={13} /> Up {upPct}%
            </button>
            <button
              type="button"
              className="btn-trade btn-trade-down"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                navigateToEvent('down')
              }}
              style={{
                flex: 1,
                padding: '8px 4px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-base)',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                cursor: 'pointer',
              }}
            >
              <TrendingDown size={13} /> Down {downPct}%
            </button>
          </div>
        </div>
      </div>

      {/* Footer custom: countdown prominente — sostituisce il volume,
          irrilevante per round 5m che hanno sempre $0. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderTop: '1px solid var(--color-border-subtle)',
          marginTop: 'auto',
          flexShrink: 0,
          gap: 8,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 'var(--font-sm)',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: countdownColor,
          }}
          className={countdownPulse ? 'live-dot' : undefined}
        >
          <Clock size={12} />
          {expired ? 'Prossimo round in arrivo…' : countdownText}
        </span>
        {symbol && (
          <span
            style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600,
            }}
          >
            {symbol.replace('usdt', '').toUpperCase()}
          </span>
        )}
      </div>
    </div>
  )
}
