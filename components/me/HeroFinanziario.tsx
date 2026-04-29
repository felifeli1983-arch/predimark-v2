'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useThemeStore } from '@/lib/stores/themeStore'
import { useBalance } from '@/lib/stores/useBalance'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

interface Stats {
  totalValue: number
  totalPnl: number
  pnlPct: number
  trades7d: number
  winRate: number
}

/**
 * Sprint 5.2.1 — Hero finanziario Robinhood-style.
 * Stat cards big-number + sparkline placeholder.
 * Adattivo REAL/DEMO via useThemeStore.
 */
export function HeroFinanziario() {
  const { ready, authenticated, getAccessToken } = usePrivy()
  const isDemo = useThemeStore((s) => s.isDemo)
  const usdcBalance = useBalance((s) => s.usdcBalance)
  const demoBalance = useBalance((s) => s.demoBalance)
  const realPortfolio = useBalance((s) => s.realPortfolioValue)
  const demoPortfolio = useBalance((s) => s.demoPortfolioValue)
  const [stats, setStats] = useState<Stats | null>(null)

  const cash = isDemo ? demoBalance : usdcBalance
  const portfolio = isDemo ? demoPortfolio : realPortfolio
  const total = cash + portfolio

  useEffect(() => {
    if (!ready || !authenticated) return
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const res = await fetch(`/api/v1/users/me/positions?is_demo=${isDemo}&only_open=true`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = (await res.json()) as {
          meta?: { totalValue?: number; totalPnl?: number; total?: number }
        }
        if (cancelled) return
        const totalValue = data.meta?.totalValue ?? 0
        const totalPnl = data.meta?.totalPnl ?? 0
        setStats({
          totalValue,
          totalPnl,
          pnlPct: totalValue > 0 ? (totalPnl / totalValue) * 100 : 0,
          trades7d: 0,
          winRate: 0,
        })
      } catch {
        // silent
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, authenticated, getAccessToken, isDemo])

  const accent = isDemo ? 'var(--color-warning)' : 'var(--color-cta)'
  const pnlPositive = (stats?.totalPnl ?? 0) >= 0

  return (
    <div
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
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
        <div
          style={{
            fontSize: 'var(--font-xs)',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Patrimonio totale {isDemo ? 'DEMO' : 'REAL'}
        </div>
      </div>
      <div
        style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', flexWrap: 'wrap' }}
      >
        <strong
          style={{
            fontSize: 'var(--font-3xl)',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          ${total.toFixed(2)}
        </strong>
        {stats && stats.totalPnl !== 0 && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: pnlPositive ? 'var(--color-success)' : 'var(--color-danger)',
              fontSize: 'var(--font-md)',
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {pnlPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {pnlPositive ? '+' : ''}${stats.totalPnl.toFixed(2)} ({pnlPositive ? '+' : ''}
            {stats.pnlPct.toFixed(2)}%)
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 'var(--space-2)',
        }}
      >
        <Stat label="Cash disponibili" value={`$${cash.toFixed(2)}`} accent={accent} />
        <Stat label="Portfolio aperto" value={`$${portfolio.toFixed(2)}`} accent={accent} />
        <Stat
          label="P&L non realizzato"
          value={`${pnlPositive ? '+' : ''}$${(stats?.totalPnl ?? 0).toFixed(2)}`}
          accent={pnlPositive ? 'var(--color-success)' : 'var(--color-danger)'}
        />
        <Stat
          label="Mode"
          value={isDemo ? 'DEMO' : 'REAL'}
          accent={accent}
          icon={<Activity size={12} />}
        />
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  accent,
  icon,
}: {
  label: string
  value: string
  accent: string
  icon?: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span
        style={{
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {icon}
        {label}
      </span>
      <strong
        style={{
          fontSize: 'var(--font-md)',
          color: accent,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </strong>
    </div>
  )
}
