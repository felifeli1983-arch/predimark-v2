'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Users, TrendingUp, DollarSign, AlertCircle, Loader2 } from 'lucide-react'

interface KPIs {
  dau: number
  totalUsers: number
  activeUsers7d: number
  signups24h: number
  totalTrades: number
  trades24h: number
  totalVolume: number
  volume24h: number
  kycPending: number
  refundsPending: number
}

export default function AdminDashboardPage() {
  const { getAccessToken } = usePrivy()
  const [data, setData] = useState<KPIs | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const res = await fetch('/api/v1/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as KPIs
        if (!cancelled) setData(json)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Errore')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [getAccessToken])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>Dashboard</h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Overview KPI e attività recente.
        </p>
      </header>

      {error ? (
        <p style={{ color: 'var(--color-danger)' }}>{error}</p>
      ) : !data ? (
        <div style={{ padding: 'var(--space-6)', display: 'flex', justifyContent: 'center' }}>
          <Loader2
            size={24}
            className="animate-spin"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-3)',
          }}
        >
          <KPICard
            icon={<Users size={18} />}
            label="Utenti totali"
            value={data.totalUsers}
            subtitle={`${data.signups24h} signup ultime 24h`}
            color="var(--color-cta)"
          />
          <KPICard
            icon={<Users size={18} />}
            label="Active (7 giorni)"
            value={data.activeUsers7d}
            subtitle={`${data.dau} DAU`}
            color="var(--color-success)"
          />
          <KPICard
            icon={<TrendingUp size={18} />}
            label="Trade totali"
            value={data.totalTrades.toLocaleString('en-US')}
            subtitle={`${data.trades24h} ultime 24h`}
            color="var(--color-cta)"
          />
          <KPICard
            icon={<DollarSign size={18} />}
            label="Volume totale"
            value={`$${data.totalVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
            subtitle={`$${data.volume24h.toLocaleString('en-US', { maximumFractionDigits: 0 })} ultime 24h`}
            color="var(--color-success)"
          />
          <KPICard
            icon={<AlertCircle size={18} />}
            label="KYC pending"
            value={data.kycPending}
            subtitle={data.kycPending > 0 ? 'Richiede review' : 'Tutto a posto'}
            color={data.kycPending > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)'}
          />
          <KPICard
            icon={<AlertCircle size={18} />}
            label="Refund pending"
            value={data.refundsPending}
            subtitle={data.refundsPending > 0 ? 'Richiede review' : 'Tutto a posto'}
            color={data.refundsPending > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)'}
          />
        </div>
      )}

      <div
        style={{
          padding: 'var(--space-4)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-sm)',
          color: 'var(--color-text-muted)',
        }}
      >
        Charts (volume over time + revenue breakdown) verranno aggiunti in MA5.2 Fase B avanzata.
        Recent admin activity (audit log preview) idem.
      </div>
    </div>
  )
}

function KPICard({
  icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  subtitle: string
  color: string
}) {
  return (
    <div
      style={{
        padding: 'var(--space-3)',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          color,
          fontSize: 'var(--font-xs)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontWeight: 600,
        }}
      >
        {icon}
        {label}
      </div>
      <strong
        style={{
          fontSize: 'var(--font-2xl)',
          fontWeight: 800,
          color: 'var(--color-text-primary)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </strong>
      <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
        {subtitle}
      </span>
    </div>
  )
}
