'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useThemeStore } from '@/lib/stores/themeStore'
import { Loader2, TrendingUp, Award, Target, Activity } from 'lucide-react'

interface UserStats {
  total_trades: number
  total_volume: number
  total_pnl: number
  total_pnl_pct: number
  win_count: number
  loss_count: number
  win_rate: number
  avg_position_size: number
  best_trade_pnl: number
  worst_trade_pnl: number
  open_positions: number
  closed_positions: number
}

/**
 * Sprint 5.3.3 — Stats + Calibration curve.
 * MVP: KPI cards + win rate + best/worst trade.
 * Calibration curve full chart deferred MA8.
 */
export default function MeStatsPage() {
  const { ready, authenticated, getAccessToken, login } = usePrivy()
  const isDemo = useThemeStore((s) => s.isDemo)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ready || !authenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const [tradesRes, posRes] = await Promise.all([
          fetch(`/api/v1/users/me/trades?is_demo=${isDemo}&period=all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/v1/users/me/positions?is_demo=${isDemo}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const trades = tradesRes.ok
          ? ((await tradesRes.json()) as { items?: Array<Record<string, unknown>> })
          : { items: [] }
        const positions = posRes.ok
          ? ((await posRes.json()) as {
              items?: Array<Record<string, unknown>>
              meta?: { total?: number }
            })
          : { items: [], meta: {} }

        const items = trades.items ?? []
        const totalVolume = items.reduce((s, t) => s + Number(t.total_amount ?? 0), 0)
        const totalPnl = items.reduce((s, t) => s + Number(t.pnl ?? 0), 0)
        const wins = items.filter((t) => Number(t.pnl ?? 0) > 0).length
        const losses = items.filter((t) => Number(t.pnl ?? 0) < 0).length
        const pnls = items.map((t) => Number(t.pnl ?? 0))
        const best = pnls.length > 0 ? Math.max(...pnls) : 0
        const worst = pnls.length > 0 ? Math.min(...pnls) : 0

        if (cancelled) return
        setStats({
          total_trades: items.length,
          total_volume: totalVolume,
          total_pnl: totalPnl,
          total_pnl_pct: totalVolume > 0 ? (totalPnl / totalVolume) * 100 : 0,
          win_count: wins,
          loss_count: losses,
          win_rate: items.length > 0 ? wins / items.length : 0,
          avg_position_size: items.length > 0 ? totalVolume / items.length : 0,
          best_trade_pnl: best,
          worst_trade_pnl: worst,
          open_positions: positions.meta?.total ?? 0,
          closed_positions: items.filter((t) => t.trade_type === 'close').length,
        })
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, authenticated, getAccessToken, isDemo])

  if (!ready) return null
  if (!authenticated) {
    return (
      <Container>
        <p style={{ color: 'var(--color-text-muted)' }}>Login per vedere le tue stats.</p>
        <button type="button" onClick={() => login()} style={primaryBtn}>
          Sign in
        </button>
      </Container>
    )
  }

  if (loading || !stats) {
    return (
      <Container>
        <Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-text-muted)' }} />
      </Container>
    )
  }

  const pnlPositive = stats.total_pnl >= 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 'var(--space-3)' }}>
      <header>
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--font-2xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          Le tue statistiche {isDemo ? 'DEMO' : 'REAL'}
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Panoramica trading completa. Calibration curve dettagliata in MA8 polish.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        <StatCard
          icon={<Activity size={18} />}
          label="Trade totali"
          value={stats.total_trades.toString()}
          sub={`Volume $${stats.total_volume.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="P&L totale"
          value={`${pnlPositive ? '+' : ''}$${stats.total_pnl.toFixed(2)}`}
          sub={`${pnlPositive ? '+' : ''}${stats.total_pnl_pct.toFixed(2)}% ROI`}
          color={pnlPositive ? 'var(--color-success)' : 'var(--color-danger)'}
        />
        <StatCard
          icon={<Target size={18} />}
          label="Win rate"
          value={`${(stats.win_rate * 100).toFixed(1)}%`}
          sub={`${stats.win_count}W · ${stats.loss_count}L`}
          color={stats.win_rate >= 0.55 ? 'var(--color-success)' : 'var(--color-warning)'}
        />
        <StatCard
          icon={<Award size={18} />}
          label="Miglior trade"
          value={`+$${stats.best_trade_pnl.toFixed(2)}`}
          sub={`Peggior: $${stats.worst_trade_pnl.toFixed(2)}`}
          color="var(--color-success)"
        />
        <StatCard
          label="Posizioni"
          value={`${stats.open_positions} aperte`}
          sub={`${stats.closed_positions} chiuse`}
        />
        <StatCard
          label="Avg position size"
          value={`$${stats.avg_position_size.toFixed(2)}`}
          sub="Per trade"
        />
      </div>

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
        📈 Calibration curve + equity chart over time arriveranno in MA8 polish.
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon?: React.ReactNode
  label: string
  value: string
  sub?: string
  color?: string
}) {
  return (
    <div
      style={{
        padding: 'var(--space-3)',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {icon} {label}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 'var(--font-xl)',
          fontWeight: 800,
          color: color ?? 'var(--color-text-primary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-6)',
      }}
    >
      {children}
    </div>
  )
}

const primaryBtn: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-4)',
  background: 'var(--color-cta)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-md)',
  fontWeight: 700,
  cursor: 'pointer',
}
