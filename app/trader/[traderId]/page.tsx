import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { FollowButton } from '@/components/creator/FollowButton'

interface Props {
  params: Promise<{ traderId: string }>
}

export default async function ExternalTraderPage({ params }: Props) {
  const { traderId } = await params
  const supabase = createAdminClient()
  const { data: trader, error } = await supabase
    .from('external_traders')
    .select(
      'id, wallet_address, polymarket_nickname, polymarket_pnl_total, polymarket_volume_total, win_rate, trades_count, specialization, rank_today, rank_7d, rank_30d, rank_all_time, last_trade_at, last_synced_at, is_active, is_blocked'
    )
    .eq('id', traderId)
    .maybeSingle()

  if (error || !trader || !trader.is_active || trader.is_blocked) {
    notFound()
  }

  const displayName =
    trader.polymarket_nickname ??
    `${trader.wallet_address.slice(0, 6)}…${trader.wallet_address.slice(-4)}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 'var(--space-3)' }}>
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: 'var(--font-2xl)',
            }}
          >
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 'var(--font-xl)',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                }}
              >
                {displayName}
              </h1>
              <span
                style={{
                  fontSize: 9,
                  padding: '2px 6px',
                  background: 'color-mix(in srgb, var(--color-warning) 16%, transparent)',
                  color: 'var(--color-warning)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                }}
              >
                POLYMARKET TRADER
              </span>
            </div>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 'var(--font-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5,
              }}
            >
              Top trader pubblico su Polymarket. Si può copy-tradare via Auktora (no opt-in
              richiesto al trader).
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <Link
                href={`https://polygonscan.com/address/${trader.wallet_address}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 'var(--font-xs)',
                  color: 'var(--color-text-muted)',
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={12} /> Polygonscan
              </Link>
            </div>
          </div>
          <FollowButton targetType="external" targetId={trader.id} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 'var(--space-2)',
          }}
        >
          <Stat
            label="P&L totale"
            value={`$${(trader.polymarket_pnl_total ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          />
          <Stat
            label="Volume totale"
            value={`$${(trader.polymarket_volume_total ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          />
          <Stat
            label="Win rate"
            value={trader.win_rate != null ? `${(trader.win_rate * 100).toFixed(0)}%` : '—'}
          />
          <Stat label="Trade totali" value={trader.trades_count ?? 0} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: 'var(--space-1)',
          }}
        >
          <Stat label="Rank oggi" value={trader.rank_today ?? '—'} />
          <Stat label="Rank 7d" value={trader.rank_7d ?? '—'} />
          <Stat label="Rank 30d" value={trader.rank_30d ?? '—'} />
          <Stat label="Rank all-time" value={trader.rank_all_time ?? '—'} />
        </div>
      </header>

      <div
        style={{
          padding: 'var(--space-4)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
        }}
      >
        Posizioni e storico trade saranno disponibili in MA6 — copy trading.
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: 'var(--space-2)',
        background: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <span
        style={{
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </span>
      <strong
        style={{
          fontSize: 'var(--font-md)',
          color: 'var(--color-text-primary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </strong>
    </div>
  )
}
