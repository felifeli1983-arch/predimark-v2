'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import type { AuktoraEvent, AuktoraMarket, AuktoraOutcome } from '@/lib/polymarket/mappers'
import { useCountdown } from '@/lib/hooks/useCountdown'
import { OutcomeRowFull } from './OutcomeRowFull'

type TradeHandler = (eventId: string, marketId: string, side: string) => void

interface Props {
  event: AuktoraEvent
  onTrade: TradeHandler
}

export function EventProbabilities({ event, onTrade }: Props) {
  const trade = (marketId: string, side: string) => onTrade(event.id, marketId, side)

  switch (event.kind) {
    case 'binary':
      return <BinaryView event={event} onTrade={trade} />
    case 'h2h_sport':
      return <H2HView event={event} onTrade={trade} />
    case 'crypto_up_down':
      return <CryptoView event={event} onTrade={trade} />
    case 'multi_strike':
      return <StrikeListView event={event} onTrade={trade} />
    case 'multi_outcome':
    default:
      return <OutcomeListView event={event} onTrade={trade} />
  }
}

interface ViewProps {
  event: AuktoraEvent
  onTrade: (marketId: string, side: string) => void
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 12,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {children}
    </section>
  )
}

function BigBtn({
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
      onClick={onClick}
      style={{
        flex: 1,
        padding: '14px 18px',
        borderRadius: 10,
        fontSize: 16,
        fontWeight: 700,
        cursor: 'pointer',
        background: isYes ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
        color: isYes ? 'var(--color-success)' : 'var(--color-danger)',
        border: `1px solid ${isYes ? 'var(--color-success)' : 'var(--color-danger)'}`,
      }}
    >
      {label}
    </button>
  )
}

function BinaryView({ event, onTrade }: ViewProps) {
  const market = event.markets[0]
  if (!market) return <EmptyMarketsHint />
  const yesPct = Math.round(market.yesPrice * 100)
  const noPct = Math.round(market.noPrice * 100)

  return (
    <Card>
      <div
        style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', gap: 16 }}
      >
        <Stat label="Yes" value={`${yesPct}%`} color="var(--color-success)" />
        <Stat label="No" value={`${noPct}%`} color="var(--color-danger)" />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <BigBtn
          label={`Buy Yes ${yesPct}¢`}
          variant="yes"
          onClick={() => onTrade(market.id, 'yes')}
        />
        <BigBtn label={`Buy No ${noPct}¢`} variant="no" onClick={() => onTrade(market.id, 'no')} />
      </div>
    </Card>
  )
}

function H2HView({ event, onTrade }: ViewProps) {
  const market = event.markets[0]
  if (!market) return <EmptyMarketsHint />
  const outcomes = market.outcomes

  return (
    <Card>
      <div
        style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', gap: 16 }}
      >
        {outcomes.map((o: AuktoraOutcome) => (
          <Stat
            key={o.name}
            label={o.name}
            value={`${Math.round(o.price * 100)}%`}
            color={o.price >= 0.5 ? 'var(--color-success)' : 'var(--color-text-secondary)'}
          />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {outcomes.map((o: AuktoraOutcome) => (
          <button
            key={o.name}
            type="button"
            onClick={() => onTrade(market.id, o.name)}
            style={{
              flex: 1,
              minWidth: 120,
              padding: '14px 18px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            {o.name}
          </button>
        ))}
      </div>
    </Card>
  )
}

function CryptoView({ event, onTrade }: ViewProps) {
  const market = event.markets[0]
  const { display: countdown, expired } = useCountdown(event.endDate)
  if (!market) return <EmptyMarketsHint />
  const upPct = Math.round(market.yesPrice * 100)
  const downPct = 100 - upPct

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Battere</div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {market.question}
          </div>
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: expired ? 'var(--color-danger)' : 'var(--color-cta)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {expired ? 'Round terminato' : `Termina in ${countdown}`}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <ActionButton
          label={`Up ${upPct}%`}
          icon={<TrendingUp size={14} />}
          variant="up"
          onClick={() => onTrade(market.id, 'up')}
        />
        <ActionButton
          label={`Down ${downPct}%`}
          icon={<TrendingDown size={14} />}
          variant="down"
          onClick={() => onTrade(market.id, 'down')}
        />
      </div>
    </Card>
  )
}

function StrikeListView({ event, onTrade }: ViewProps) {
  const sorted = [...event.markets].sort((a, b) => extractStrike(b) - extractStrike(a))
  const currentIdx = sorted.findIndex((m) => m.yesPrice > 0.5)

  return (
    <Card>
      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        Soglie
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map((m, i) => (
          <OutcomeRowFull
            key={m.id}
            market={m}
            highlighted={i === currentIdx}
            onTrade={(side) => onTrade(m.id, side)}
          />
        ))}
      </div>
    </Card>
  )
}

function OutcomeListView({ event, onTrade }: ViewProps) {
  const sorted = [...event.markets].sort((a, b) => b.yesPrice - a.yesPrice)
  return (
    <Card>
      <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--color-text-primary)' }}>
        Candidati
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map((m) => (
          <OutcomeRowFull
            key={m.id}
            market={m}
            label={m.groupItemTitle || m.question}
            onTrade={(side) => onTrade(m.id, side)}
          />
        ))}
      </div>
    </Card>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontSize: 11,
          color: 'var(--color-text-muted)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 32, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  )
}

function ActionButton({
  label,
  icon,
  variant,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  variant: 'up' | 'down'
  onClick: () => void
}) {
  const isUp = variant === 'up'
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        padding: '14px 18px',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        background: isUp ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
        color: isUp ? 'var(--color-success)' : 'var(--color-danger)',
        border: `1px solid ${isUp ? 'var(--color-success)' : 'var(--color-danger)'}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}
    >
      {icon}
      {label}
    </button>
  )
}

function EmptyMarketsHint() {
  return (
    <Card>
      <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 13 }}>
        Mercato senza outcomes disponibili.
      </p>
    </Card>
  )
}

const STRIKE_RX = /\$?([\d,]+(?:\.\d+)?)\s*([kKmMbB])?/

function extractStrike(market: AuktoraMarket): number {
  const m = market.question.match(STRIKE_RX)
  if (!m || !m[1]) return 0
  const num = parseFloat(m[1].replace(/,/g, ''))
  if (!Number.isFinite(num)) return 0
  const suffix = m[2]?.toLowerCase()
  if (suffix === 'k') return num * 1_000
  if (suffix === 'm') return num * 1_000_000
  if (suffix === 'b') return num * 1_000_000_000
  return num
}
