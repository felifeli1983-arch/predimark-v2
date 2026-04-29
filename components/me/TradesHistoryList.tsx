'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { History, Download } from 'lucide-react'
import { useThemeStore } from '@/lib/stores/themeStore'
import { fetchTradesHistory, type TradeHistoryItem } from '@/lib/api/positions-client'
import { TradeHistoryRow } from './TradeHistoryRow'

type TypeFilter = 'all' | 'open' | 'close' | 'resolution'
type PeriodFilter = 'today' | '7d' | '30d' | 'all'

const TYPE_TABS: Array<{ value: TypeFilter; label: string }> = [
  { value: 'all', label: 'Tutti' },
  { value: 'open', label: 'Aperture' },
  { value: 'close', label: 'Vendite' },
  { value: 'resolution', label: 'Risoluzioni' },
]

const PERIOD_TABS: Array<{ value: PeriodFilter; label: string }> = [
  { value: 'today', label: 'Oggi' },
  { value: '7d', label: '7g' },
  { value: '30d', label: '30g' },
  { value: 'all', label: 'Tutto' },
]

export function TradesHistoryList() {
  const { ready, authenticated, getAccessToken, login } = usePrivy()
  const isDemo = useThemeStore((s) => s.isDemo)
  const [items, setItems] = useState<TradeHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30d')

  useEffect(() => {
    if (!ready) return
    if (!authenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const token = await getAccessToken()
        if (!token) throw new Error('Sessione scaduta')
        const data = await fetchTradesHistory(token, {
          isDemo,
          type: typeFilter === 'all' ? undefined : typeFilter,
          period: periodFilter,
        })
        if (!cancelled) {
          setItems(data.items)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Errore caricamento')
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [ready, authenticated, getAccessToken, isDemo, typeFilter, periodFilter])

  if (!ready) return <SkeletonList />
  if (!authenticated) return <LoginPrompt onLogin={login} />

  function exportCsv() {
    const headers = ['Date', 'Type', 'Market', 'Side', 'Shares', 'Price', 'Total', 'PnL', 'IsDemo']
    const rows = items.map((t) => {
      const item = t as unknown as Record<string, unknown>
      return [
        item.executed_at ?? '',
        item.trade_type ?? '',
        item.market_title ?? item.market_id ?? '',
        item.side ?? '',
        item.shares ?? 0,
        item.price ?? 0,
        item.total_amount ?? 0,
        item.pnl ?? 0,
        item.is_demo ?? false,
      ].join(',')
    })
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `auktora-trades-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <FilterBar
          typeFilter={typeFilter}
          periodFilter={periodFilter}
          onTypeChange={setTypeFilter}
          onPeriodChange={setPeriodFilter}
        />
        {items.length > 0 && (
          <button
            type="button"
            onClick={exportCsv}
            aria-label="Export CSV"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 12px',
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-xs)',
              cursor: 'pointer',
            }}
          >
            <Download size={12} /> Export CSV
          </button>
        )}
      </div>

      {error ? (
        <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-base)' }}>{error}</p>
      ) : loading ? (
        <SkeletonList />
      ) : items.length === 0 ? (
        <EmptyState />
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
          {items.map((t) => (
            <li key={t.id}>
              <TradeHistoryRow trade={t} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FilterBar({
  typeFilter,
  periodFilter,
  onTypeChange,
  onPeriodChange,
}: {
  typeFilter: TypeFilter
  periodFilter: PeriodFilter
  onTypeChange: (v: TypeFilter) => void
  onPeriodChange: (v: PeriodFilter) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ChipRow>
        {TYPE_TABS.map((t) => (
          <Chip key={t.value} active={typeFilter === t.value} onClick={() => onTypeChange(t.value)}>
            {t.label}
          </Chip>
        ))}
      </ChipRow>
      <ChipRow>
        {PERIOD_TABS.map((p) => (
          <Chip
            key={p.value}
            active={periodFilter === p.value}
            onClick={() => onPeriodChange(p.value)}
          >
            {p.label}
          </Chip>
        ))}
      </ChipRow>
    </div>
  )
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
      }}
    >
      {children}
    </div>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 12px',
        background: active ? 'var(--color-cta)' : 'var(--color-bg-secondary)',
        color: active ? '#fff' : 'var(--color-text-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        fontSize: 'var(--font-xs)',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

function SkeletonList() {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
      {[0, 1, 2, 3].map((i) => (
        <li
          key={i}
          style={{
            height: 64,
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        />
      ))}
    </ul>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '40px 16px',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <History
        size={28}
        style={{ color: 'var(--color-text-muted)', marginBottom: 12, opacity: 0.5 }}
      />
      <div
        style={{
          fontSize: 'var(--font-md)',
          color: 'var(--color-text-secondary)',
          marginBottom: 6,
        }}
      >
        Nessun trade nel periodo selezionato
      </div>
      <div style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
        Cambia i filtri o apri un nuovo trade dalla home.
      </div>
    </div>
  )
}

function LoginPrompt({ onLogin }: { onLogin: () => void }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '40px 16px',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <History
        size={28}
        style={{ color: 'var(--color-text-muted)', marginBottom: 12, opacity: 0.5 }}
      />
      <div
        style={{
          fontSize: 'var(--font-md)',
          color: 'var(--color-text-secondary)',
          marginBottom: 12,
        }}
      >
        Effettua login per vedere il tuo storico
      </div>
      <button
        type="button"
        onClick={onLogin}
        style={{
          background: 'var(--color-cta)',
          color: '#fff',
          border: 'none',
          padding: '10px 18px',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-base)',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Sign in
      </button>
    </div>
  )
}
