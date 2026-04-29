'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Loader2 } from 'lucide-react'

interface AuditEntry {
  id: string
  created_at: string
  actor_user_id: string | null
  action_type: string
  target_type: string | null
  target_id: string | null
  before_value: unknown
  after_value: unknown
  reason_note: string | null
}

export default function AdminAuditLogPage() {
  const { getAccessToken } = usePrivy()
  const [items, setItems] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const token = await getAccessToken()
        if (!token) return
        const res = await fetch('/api/v1/admin/audit-log?limit=200', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as { items: AuditEntry[] }
        if (!cancelled) setItems(data.items)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Errore')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [getAccessToken])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--font-2xl)', fontWeight: 700 }}>Audit Log</h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Ultimi 200 eventi admin. Append-only, no modifica/cancellazione possibile.
        </p>
      </header>

      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-6)' }}>
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
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-muted)',
          }}
        >
          Nessun evento audit registrato.
        </div>
      ) : (
        <div
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-sm)' }}>
            <thead>
              <tr style={headerRow}>
                <th style={cellStyle}>Time</th>
                <th style={cellStyle}>Actor</th>
                <th style={cellStyle}>Action</th>
                <th style={cellStyle}>Target</th>
                <th style={cellStyle}>Reason</th>
                <th style={cellStyle}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((entry) => (
                <>
                  <tr
                    key={entry.id}
                    onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                    style={{
                      ...rowStyle,
                      cursor: 'pointer',
                      background: expandedId === entry.id ? 'var(--color-bg-tertiary)' : undefined,
                    }}
                  >
                    <td style={cellStyle}>
                      {new Date(entry.created_at).toLocaleString('it-IT', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td
                      style={{ ...cellStyle, fontFamily: 'monospace', fontSize: 'var(--font-xs)' }}
                    >
                      {entry.actor_user_id?.slice(0, 8) ?? 'system'}
                    </td>
                    <td style={cellStyle}>
                      <code style={actionBadge}>{entry.action_type}</code>
                    </td>
                    <td
                      style={{ ...cellStyle, fontFamily: 'monospace', fontSize: 'var(--font-xs)' }}
                    >
                      {entry.target_type}: {entry.target_id?.slice(0, 8) ?? '—'}
                    </td>
                    <td style={cellStyle}>{entry.reason_note ?? '—'}</td>
                    <td style={cellStyle}>{expandedId === entry.id ? '▲' : '▼'}</td>
                  </tr>
                  {expandedId === entry.id && (
                    <tr>
                      <td
                        colSpan={6}
                        style={{ ...cellStyle, background: 'var(--color-bg-tertiary)' }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <strong
                              style={{
                                fontSize: 'var(--font-xs)',
                                color: 'var(--color-text-muted)',
                              }}
                            >
                              BEFORE
                            </strong>
                            <pre style={diffStyle}>
                              {JSON.stringify(entry.before_value, null, 2) ?? 'null'}
                            </pre>
                          </div>
                          <div>
                            <strong
                              style={{
                                fontSize: 'var(--font-xs)',
                                color: 'var(--color-text-muted)',
                              }}
                            >
                              AFTER
                            </strong>
                            <pre style={diffStyle}>
                              {JSON.stringify(entry.after_value, null, 2) ?? 'null'}
                            </pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
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

const rowStyle: React.CSSProperties = {
  borderTop: '1px solid var(--color-border-subtle)',
  color: 'var(--color-text-secondary)',
}

const cellStyle: React.CSSProperties = {
  padding: 'var(--space-2) var(--space-3)',
}

const actionBadge: React.CSSProperties = {
  fontSize: 'var(--font-xs)',
  padding: '2px 6px',
  background: 'var(--color-bg-tertiary)',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'monospace',
  color: 'var(--color-cta)',
}

const diffStyle: React.CSSProperties = {
  margin: 0,
  padding: 'var(--space-2)',
  background: 'var(--color-bg-primary)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--font-xs)',
  color: 'var(--color-text-primary)',
  fontFamily: 'monospace',
  overflow: 'auto',
  maxHeight: 200,
}
