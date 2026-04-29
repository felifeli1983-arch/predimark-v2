'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Search, Loader2 } from 'lucide-react'

interface User {
  id: string
  email: string | null
  username: string | null
  display_name: string | null
  privy_did: string | null
  last_login_at: string | null
  created_at: string
  deleted_at: string | null
  is_suspended: boolean | null
  country_code: string | null
}

interface ListResponse {
  items: User[]
  meta: { total: number; page: number; perPage: number; hasMore: boolean }
}

export default function AdminUsersPage() {
  const { getAccessToken } = usePrivy()
  const [items, setItems] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState<ListResponse['meta'] | null>(null)

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        if (status) params.set('status', status)
        const res = await fetch(`/api/v1/admin/users?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as ListResponse
        if (!cancelled) {
          setItems(data.items)
          setMeta(data.meta)
        }
      } catch {
        // noop
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [search, status, getAccessToken])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>Users</h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          {meta ? `${meta.total} totale` : '—'} · ricerca per email o ID, filtra per status.
        </p>
      </header>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Email o user ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px 6px 32px',
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-sm)',
            }}
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            padding: '6px 10px',
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--font-sm)',
          }}
        >
          <option value="">Tutti</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: 'var(--space-6)', display: 'flex', justifyContent: 'center' }}>
            <Loader2
              size={20}
              className="animate-spin"
              style={{ color: 'var(--color-text-muted)' }}
            />
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              padding: 'var(--space-6)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--font-sm)',
            }}
          >
            Nessun utente trovato.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-sm)' }}>
            <thead>
              <tr
                style={{
                  background: 'var(--color-bg-tertiary)',
                  textAlign: 'left',
                  fontSize: 'var(--font-xs)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-text-muted)',
                }}
              >
                <th style={cellStyle}>ID</th>
                <th style={cellStyle}>Email</th>
                <th style={cellStyle}>Country</th>
                <th style={cellStyle}>Status</th>
                <th style={cellStyle}>Last login</th>
                <th style={cellStyle}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr
                  key={u.id}
                  style={{
                    borderTop: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  <td style={{ ...cellStyle, fontFamily: 'monospace', fontSize: 'var(--font-xs)' }}>
                    {u.id.slice(0, 8)}…
                  </td>
                  <td style={cellStyle}>{u.email ?? u.username ?? '—'}</td>
                  <td style={cellStyle}>{u.country_code ?? '—'}</td>
                  <td style={cellStyle}>
                    {u.deleted_at ? (
                      <Badge color="var(--color-danger)" label="Deleted" />
                    ) : u.is_suspended ? (
                      <Badge color="var(--color-warning)" label="Suspended" />
                    ) : (
                      <Badge color="var(--color-success)" label="Active" />
                    )}
                  </td>
                  <td style={cellStyle}>
                    {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString('it-IT') : '—'}
                  </td>
                  <td style={cellStyle}>{new Date(u.created_at).toLocaleDateString('it-IT')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function Badge({ color, label }: { color: string; label: string }) {
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
      }}
    >
      {label}
    </span>
  )
}

const cellStyle: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
}
