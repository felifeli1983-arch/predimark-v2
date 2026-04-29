'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Loader2, DollarSign } from 'lucide-react'

interface Payout {
  id: string
  creator_id: string
  period_start: string
  period_end: string
  total_volume_copied: number
  total_builder_fee: number
  payout_amount: number
  status: string
  paid_at: string | null
  payment_tx_hash: string | null
}

export default function AdminCreatorPayoutsPage() {
  const { getAccessToken } = usePrivy()
  const [items, setItems] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'paid' | 'all'>('pending')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const res = await fetch(`/api/v1/admin/creators/payouts?status=${filter}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = (await res.json()) as { items: Payout[] }
          if (!cancelled) setItems(data.items)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [filter, getAccessToken])

  const totalDue = items
    .filter((p) => p.status === 'pending')
    .reduce((s, p) => s + Number(p.payout_amount ?? 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>
          <DollarSign size={20} style={{ display: 'inline', marginRight: 8 }} />
          Creator Payouts
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Pending: ${totalDue.toFixed(2)} totali. Bot mensile distribuisce on-chain (1° del mese).
        </p>
      </header>

      <div style={{ display: 'flex', gap: 6 }}>
        {(['pending', 'paid', 'all'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 12px',
              background: filter === f ? 'var(--color-cta)' : 'var(--color-bg-tertiary)',
              color: filter === f ? '#fff' : 'var(--color-text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-sm)',
              cursor: 'pointer',
            }}
          >
            {f === 'pending' ? 'Pending' : f === 'paid' ? 'Paid' : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 'var(--space-6)', display: 'flex', justifyContent: 'center' }}>
          <Loader2 size={20} className="animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Empty message="Nessun payout in questo stato." />
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-sm)' }}>
          <thead>
            <tr style={headerRow}>
              <th style={cell}>Creator</th>
              <th style={cell}>Period</th>
              <th style={cell}>Volume</th>
              <th style={cell}>Builder fee</th>
              <th style={cell}>Payout</th>
              <th style={cell}>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} style={row}>
                <td style={{ ...cell, fontFamily: 'monospace', fontSize: 'var(--font-xs)' }}>
                  {p.creator_id.slice(0, 8)}…
                </td>
                <td style={cell}>
                  {new Date(p.period_start).toLocaleDateString('it-IT')} →{' '}
                  {new Date(p.period_end).toLocaleDateString('it-IT')}
                </td>
                <td style={cell}>${Number(p.total_volume_copied ?? 0).toFixed(2)}</td>
                <td style={cell}>${Number(p.total_builder_fee ?? 0).toFixed(2)}</td>
                <td style={cell}>
                  <strong style={{ color: 'var(--color-success)' }}>
                    ${Number(p.payout_amount ?? 0).toFixed(2)}
                  </strong>
                </td>
                <td style={cell}>
                  <span
                    style={{
                      fontSize: 9,
                      padding: '2px 6px',
                      background:
                        p.status === 'paid'
                          ? 'color-mix(in srgb, var(--color-success) 16%, transparent)'
                          : 'color-mix(in srgb, var(--color-warning) 16%, transparent)',
                      color: p.status === 'paid' ? 'var(--color-success)' : 'var(--color-warning)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function Empty({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: 'var(--space-6)',
        textAlign: 'center',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-text-muted)',
      }}
    >
      {message}
    </div>
  )
}

const headerRow: React.CSSProperties = {
  background: 'var(--color-bg-tertiary)',
  textAlign: 'left',
  fontSize: 'var(--font-xs)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--color-text-muted)',
}
const row: React.CSSProperties = {
  borderTop: '1px solid var(--color-border-subtle)',
  color: 'var(--color-text-secondary)',
}
const cell: React.CSSProperties = { padding: 'var(--space-2) var(--space-3)' }
