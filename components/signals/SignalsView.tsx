'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, TrendingUp, TrendingDown, Zap, Activity } from 'lucide-react'

interface Signal {
  id: string
  market_id: string
  algorithm_name: string
  direction: 'YES' | 'NO' | 'UP' | 'DOWN' | 'BUY' | 'SELL'
  edge_pct: number
  confidence_pct: number
  predicted_probability: number
  current_market_price: number
  valid_from: string
  valid_until: string
  status: string
}

interface Performance {
  total_signals: number
  hit_rate: number
  avg_edge_claimed: number
  avg_edge_realized: number
}

export function SignalsView() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [perf, setPerf] = useState<Performance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [sRes, pRes] = await Promise.all([
          fetch('/api/v1/signals?status=active&limit=50'),
          fetch('/api/v1/signals/performance'),
        ])
        if (sRes.ok && !cancelled) {
          const sData = (await sRes.json()) as { items: Signal[] }
          setSignals(sData.items)
        }
        if (pRes.ok && !cancelled) {
          setPerf((await pRes.json()) as Performance)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {perf && perf.total_signals > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 'var(--space-2)',
          }}
        >
          <PerfCard label="Track record" value={`${perf.total_signals} signals`} />
          <PerfCard
            label="Win rate"
            value={`${(perf.hit_rate * 100).toFixed(1)}%`}
            color={perf.hit_rate >= 0.55 ? 'var(--color-success)' : 'var(--color-warning)'}
          />
          <PerfCard label="Edge claimed avg" value={`+${perf.avg_edge_claimed.toFixed(1)}%`} />
          <PerfCard
            label="Edge realized avg"
            value={`${perf.avg_edge_realized > 0 ? '+' : ''}${perf.avg_edge_realized.toFixed(1)}%`}
            color={perf.avg_edge_realized > 0 ? 'var(--color-success)' : 'var(--color-danger)'}
          />
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-6)' }}>
          <Loader2
            size={24}
            className="animate-spin"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </div>
      ) : signals.length === 0 ? (
        <EmptyState />
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
          {signals.map((s) => (
            <li key={s.id}>
              <SignalCard signal={s} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function SignalCard({ signal }: { signal: Signal }) {
  const isPositive = ['YES', 'UP', 'BUY'].includes(signal.direction)
  const Icon = isPositive ? TrendingUp : TrendingDown
  const color = isPositive ? 'var(--color-success)' : 'var(--color-danger)'

  return (
    <Link
      href={`/event?market=${signal.market_id}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3)',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        textDecoration: 'none',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-full)',
          background: `color-mix(in srgb, ${color} 16%, transparent)`,
          color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <strong style={{ fontSize: 'var(--font-md)', color: 'var(--color-text-primary)' }}>
            {signal.direction}
          </strong>
          <span style={badgeStyle}>EDGE +{signal.edge_pct.toFixed(1)}%</span>
          <span
            style={{
              ...badgeStyle,
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-muted)',
            }}
          >
            {signal.confidence_pct.toFixed(0)}% confidence
          </span>
        </div>
        <p
          style={{
            margin: '2px 0 0',
            fontSize: 'var(--font-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          {signal.algorithm_name} · Predicted {(signal.predicted_probability * 100).toFixed(1)}% vs
          market {(signal.current_market_price * 100).toFixed(1)}% · valido fino{' '}
          {new Date(signal.valid_until).toLocaleDateString('it-IT')}
        </p>
      </div>
    </Link>
  )
}

function PerfCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div
      style={{
        padding: 'var(--space-2)',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <span
        style={{
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          display: 'block',
        }}
      >
        {label}
      </span>
      <strong
        style={{
          fontSize: 'var(--font-md)',
          color: color ?? 'var(--color-text-primary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </strong>
    </div>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        padding: 'var(--space-6) var(--space-4)',
        textAlign: 'center',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-2)',
      }}
    >
      <Activity size={48} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} />
      <h2
        style={{
          margin: 0,
          fontSize: 'var(--font-md)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
        }}
      >
        Nessun signal attivo
      </h2>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-muted)',
          maxWidth: 480,
        }}
      >
        Il nostro engine genera signal quando rileva discrepanze prezzo-probabilità sui mercati
        Polymarket. Algoritmi attivi: <strong>orderbook imbalance</strong>,{' '}
        <strong>final period momentum</strong>, <strong>news catalyst</strong>.
      </p>
      <p style={{ margin: 0, fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
        Torna più tardi o segui Verified Creators per discovery alternativa.
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <Link
          href="/leaderboard"
          style={{
            padding: '6px 12px',
            background: 'var(--color-cta)',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--font-sm)',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Zap size={14} /> Vai a Leaderboard
        </Link>
      </div>
    </div>
  )
}

const badgeStyle: React.CSSProperties = {
  fontSize: 9,
  padding: '2px 6px',
  background: 'color-mix(in srgb, var(--color-cta) 16%, transparent)',
  color: 'var(--color-cta)',
  borderRadius: 'var(--radius-sm)',
  fontWeight: 700,
  letterSpacing: '0.04em',
}
