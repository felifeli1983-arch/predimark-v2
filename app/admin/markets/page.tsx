'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Loader2, Eye, EyeOff, Star } from 'lucide-react'

interface Market {
  id: string
  title: string
  category: string | null
  volume_total: number | null
  volume_24h: number | null
  is_active: boolean | null
  is_featured: boolean | null
  is_hidden: boolean | null
  resolves_at: string | null
}

export default function AdminMarketsPage() {
  const { getAccessToken } = usePrivy()
  const [items, setItems] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const res = await fetch('/api/v1/admin/markets?limit=100', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = (await res.json()) as { items: Market[] }
          if (!cancelled) setItems(data.items)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [getAccessToken])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>Markets</h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          {items.length} markets in DB. Featured + curate drag-drop in MA8 polish.
        </p>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-6)' }}>
          <Loader2
            size={20}
            className="animate-spin"
            style={{ color: 'var(--color-text-muted)' }}
          />
        </div>
      ) : items.length === 0 ? (
        <Empty message="Nessun market in DB. Sync via Polymarket Gamma API." />
      ) : (
        <table style={{ width: '100%', fontSize: 'var(--font-sm)', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={headerRow}>
              <th style={cell}>Title</th>
              <th style={cell}>Category</th>
              <th style={cell}>Volume 24h</th>
              <th style={cell}>Status</th>
              <th style={cell}>Resolves</th>
            </tr>
          </thead>
          <tbody>
            {items.map((m) => (
              <tr key={m.id} style={row}>
                <td style={cell}>
                  <strong style={{ color: 'var(--color-text-primary)' }}>{m.title}</strong>
                </td>
                <td style={cell}>{m.category ?? '—'}</td>
                <td style={cell}>
                  ${Number(m.volume_24h ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </td>
                <td style={cell}>
                  {m.is_hidden ? (
                    <Badge color="var(--color-danger)" icon={<EyeOff size={10} />}>
                      Hidden
                    </Badge>
                  ) : m.is_featured ? (
                    <Badge color="var(--color-warning)" icon={<Star size={10} />}>
                      Featured
                    </Badge>
                  ) : (
                    <Badge color="var(--color-success)" icon={<Eye size={10} />}>
                      Active
                    </Badge>
                  )}
                </td>
                <td style={cell}>
                  {m.resolves_at ? new Date(m.resolves_at).toLocaleDateString('it-IT') : '—'}
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

function Badge({
  color,
  icon,
  children,
}: {
  color: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <span
      style={{
        fontSize: 9,
        padding: '2px 6px',
        background: `color-mix(in srgb, ${color} 16%, transparent)`,
        color,
        borderRadius: 'var(--radius-sm)',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
      }}
    >
      {icon}
      {children}
    </span>
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
