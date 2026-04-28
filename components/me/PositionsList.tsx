'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Activity } from 'lucide-react'
import { useThemeStore } from '@/lib/stores/themeStore'
import { fetchOpenPositions, type PositionItem } from '@/lib/api/positions-client'
import { FundActionsRow } from '@/components/funding/FundActionsRow'
import { PositionRow } from './PositionRow'
import { SellConfirmModal } from './SellConfirmModal'

export function PositionsList() {
  const { ready, authenticated, getAccessToken, login } = usePrivy()
  const isDemo = useThemeStore((s) => s.isDemo)
  const [items, setItems] = useState<PositionItem[]>([])
  const [meta, setMeta] = useState<{ total: number; totalValue: number; totalPnl: number }>({
    total: 0,
    totalValue: 0,
    totalPnl: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sellTarget, setSellTarget] = useState<PositionItem | null>(null)

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
        const token = await getAccessToken()
        if (!token) throw new Error('Sessione scaduta')
        const data = await fetchOpenPositions(token, isDemo)
        if (!cancelled) {
          setItems(data.items)
          setMeta({
            total: data.meta.total,
            totalValue: data.meta.totalValue,
            totalPnl: data.meta.totalPnl,
          })
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
  }, [ready, authenticated, getAccessToken, isDemo])

  function handleSold(positionId: string, sharesSold: number) {
    setItems((prev) =>
      prev
        .map((p) => (p.id === positionId ? { ...p, shares: p.shares - sharesSold } : p))
        .filter((p) => p.shares > 0)
    )
    setSellTarget(null)
  }

  if (!ready || loading) return <SkeletonList />
  if (!authenticated) return <LoginPrompt onLogin={login} />
  if (error)
    return <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-base)' }}>{error}</p>

  if (items.length === 0) {
    return (
      <EmptyState
        title={isDemo ? 'Nessuna posizione DEMO aperta' : 'Nessuna posizione aperta'}
        subtitle={
          isDemo
            ? 'Apri un trade DEMO dalla home per vedere qui le tue posizioni.'
            : 'Apri un trade dalla home per vedere qui le tue posizioni.'
        }
      />
    )
  }

  return (
    <>
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
          <Stat label="Valore totale" value={`$${meta.totalValue.toFixed(2)}`} />
          <Stat
            label="P&L non realizzato"
            value={`${meta.totalPnl >= 0 ? '+' : ''}$${meta.totalPnl.toFixed(2)}`}
            color={meta.totalPnl >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}
          />
          <Stat label="Posizioni aperte" value={String(meta.total)} />
        </div>
        {!isDemo && <FundActionsRow pusdBalance={meta.totalValue} />}
      </header>

      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
        {items.map((p) => (
          <li key={p.id}>
            <PositionRow position={p} onSell={() => setSellTarget(p)} />
          </li>
        ))}
      </ul>

      <SellConfirmModal
        position={sellTarget}
        onClose={() => setSellTarget(null)}
        onSold={handleSold}
      />
    </>
  )
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span
        style={{
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <strong
        style={{
          fontSize: 'var(--font-lg)',
          fontWeight: 700,
          color: color ?? 'var(--color-text-primary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </strong>
    </div>
  )
}

function SkeletonList() {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          style={{
            height: 72,
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        />
      ))}
    </ul>
  )
}

function LoginPrompt({ onLogin }: { onLogin: () => void }) {
  return (
    <EmptyState
      title="Effettua login per vedere le tue posizioni"
      action={
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
            marginTop: 12,
          }}
        >
          Sign in
        </button>
      }
    />
  )
}

function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
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
      <Activity
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
        {title}
      </div>
      {subtitle && (
        <div
          style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}
        >
          {subtitle}
        </div>
      )}
      {action}
    </div>
  )
}
