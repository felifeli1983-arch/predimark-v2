'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, TrendingUp, TrendingDown } from 'lucide-react'
import { mapGammaEvent, type AuktoraEvent } from '@/lib/polymarket/mappers'
import { fetchEventById } from '@/lib/polymarket/queries'
import { useCountdown } from '@/lib/hooks/useCountdown'
import { useCryptoLivePrice } from '@/lib/ws/hooks/useCryptoLivePrice'
import { useLiveMidpoint } from '@/lib/ws/hooks/useLiveMidpoint'
import { useLiveActivity } from '@/lib/ws/hooks/useLiveActivity'
import { EventCardHeader } from '../EventCardHeader'
import { EventCardFooter } from '../EventCardFooter'
import { StarToggle, watchlistStubToggle } from '../StarToggle'
import { Thermometer } from '../charts/Thermometer'

interface Props {
  event: AuktoraEvent
  onBookmark?: (eventId: string) => void
}

const SHORT_ROUND_MS = 30 * 60 * 1000 // ≤30min → Chainlink, oltre → Binance
const REFRESH_INTERVAL_MS = 30_000

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

const TARGET_RX = /\$?([\d,]+(?:\.\d+)?)\s*([kKmMbB])?/

function extractTargetPrice(label: string): number | null {
  if (!label) return null
  const m = label.match(TARGET_RX)
  if (!m || !m[1]) return null
  const num = parseFloat(m[1].replace(/,/g, ''))
  if (!Number.isFinite(num)) return null
  const suffix = m[2]?.toLowerCase()
  if (suffix === 'k') return num * 1_000
  if (suffix === 'm') return num * 1_000_000
  if (suffix === 'b') return num * 1_000_000_000
  return num
}

function formatUsd(n: number | null): string {
  if (n === null || !Number.isFinite(n)) return '—'
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function CryptoCard({ event: initialEvent, onBookmark }: Props) {
  const [event, setEvent] = useState(initialEvent)
  const router = useRouter()
  const market = event.markets[0]
  const symbol = extractSymbol(event.slug, event.title)
  const target = extractTargetPrice(market?.question ?? event.title)

  // Source selection: durata residua <=30min → Chainlink (più affidabile per round brevi),
  // oltre → Binance. Date.now() è impuro per definizione, ma qui serve una sola decisione
  // di quale topic WS aprire — non causa render instabili perché la dep è solo endDate.
  const source = useMemo<'chainlink' | 'binance'>(() => {
    // eslint-disable-next-line react-hooks/purity
    const remainingMs = event.endDate.getTime() - Date.now()
    return remainingMs > 0 && remainingMs <= SHORT_ROUND_MS ? 'chainlink' : 'binance'
  }, [event.endDate])

  const { price: livePrice } = useCryptoLivePrice(symbol ?? '', source)
  const { midpoint: upMidpoint } = useLiveMidpoint(market?.clobTokenIds?.[0] ?? null)
  const activity = useLiveActivity({ marketId: market?.id, limit: 1 })
  const { display: countdownText, expired } = useCountdown(event.endDate)

  // Probabilità live: se WS non connesso → fallback a yesPrice statico
  const upProb = upMidpoint ?? market?.yesPrice ?? 0.5
  const downProb = 1 - upProb
  const upPct = Math.round(upProb * 100)
  const downPct = Math.round(downProb * 100)

  // Auto-refresh round ogni 30s
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const fresh = await fetchEventById(event.id)
        if (fresh) setEvent(mapGammaEvent(fresh))
      } catch {
        // silenzioso: WS continua a funzionare anche se polling fallisce
      }
    }, REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  }, [event.id])

  const isLive = !expired && event.active
  const lastTrade = activity[0]
  const livePriceDelta = livePrice !== null && target !== null ? livePrice - target : null

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
              isFavorite={false}
              onToggle={() => watchlistStubToggle(market.id)}
              marketLabel={event.title}
            />
          ) : undefined
        }
      />

      <div
        style={{
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', gap: 12, flex: 1, minHeight: 0 }}>
          {/* Sezione sinistra: prezzi + bottoni */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            {/* Prezzo target */}
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              Battere:{' '}
              <strong
                style={{ color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}
              >
                {formatUsd(target)}
              </strong>
            </div>

            {/* Prezzo live + delta */}
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                fontVariantNumeric: 'tabular-nums',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {formatUsd(livePrice)}
              {livePriceDelta !== null && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: livePriceDelta >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                  }}
                >
                  {livePriceDelta >= 0 ? '↗' : '↘'} {livePriceDelta >= 0 ? '+' : ''}
                  {livePriceDelta.toFixed(2)}
                </span>
              )}
            </div>

            {/* Bottoni Up/Down */}
            <div style={{ display: 'flex', gap: 6 }}>
              <ActionButton
                label="Up"
                icon={<TrendingUp size={11} />}
                percent={upPct}
                variant="up"
                lastAmount={lastTrade?.side === 'BUY' ? lastTrade.amount : null}
                onClick={() => navigateToEvent('up')}
              />
              <ActionButton
                label="Down"
                icon={<TrendingDown size={11} />}
                percent={downPct}
                variant="down"
                lastAmount={lastTrade?.side === 'SELL' ? lastTrade.amount : null}
                onClick={() => navigateToEvent('down')}
              />
            </div>
          </div>

          {/* Sezione destra: termometro */}
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <Thermometer upProbability={upProb} />
          </div>
        </div>

        {/* Countdown — dentro il body, senza divider proprio */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 10,
            color: expired ? 'var(--color-danger)' : 'var(--color-text-muted)',
            fontVariantNumeric: 'tabular-nums',
            flexShrink: 0,
          }}
        >
          <Clock size={10} />
          {expired ? 'Round terminato' : `Round termina in ${countdownText}`}
        </div>
      </div>

      <EventCardFooter volume={event.totalVolume} endDate={event.endDate} />
    </div>
  )
}

function ActionButton({
  label,
  icon,
  percent,
  variant,
  lastAmount,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  percent: number
  variant: 'up' | 'down'
  lastAmount: number | null
  onClick?: () => void
}) {
  const isUp = variant === 'up'
  return (
    <button
      type="button"
      onClick={(e) => {
        if (!onClick) return
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        padding: '6px 4px',
        borderRadius: 6,
        cursor: onClick ? 'pointer' : 'default',
        background: isUp ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
        color: isUp ? 'var(--color-success)' : 'var(--color-danger)',
        border: `1px solid ${isUp ? 'var(--color-success)' : 'var(--color-danger)'}`,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        {icon}
        {label} {percent}%
      </span>
      {lastAmount !== null && (
        <span
          key={lastAmount}
          className="live-dot"
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: isUp ? 'var(--color-success)' : 'var(--color-danger)',
            opacity: 0.85,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {isUp ? '+' : ''}${lastAmount.toFixed(0)} {isUp ? '↗' : '↘'}
        </span>
      )}
    </button>
  )
}
