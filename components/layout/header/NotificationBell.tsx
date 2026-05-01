'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, CheckCircle2, XCircle, Award, X } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'

interface PolymarketNotification {
  id: number
  type: number
  typeLabel: 'cancellation' | 'fill' | 'market_resolved' | 'unknown'
  payload: unknown
  timestamp: number | null
}

const POLL_MS = 60_000

/**
 * Notifiche eventi Polymarket — Doc L2 Methods → getNotifications.
 * Polling 60s mentre l'utente è auth + dropdown lista al click sul bell.
 *
 * Tipi notifica (Doc):
 *  - 1 cancellation: ordine cancellato (es. expired GTD)
 *  - 2 fill: ordine matchato (parziale o totale)
 *  - 4 market_resolved: market chiuso → posizione redeem-able
 */
export function NotificationBell({ iconBtnStyle }: { iconBtnStyle: React.CSSProperties }) {
  const { authenticated, getAccessToken } = usePrivy()
  const [items, setItems] = useState<PolymarketNotification[]>([])
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems([])
      return
    }
    let cancelled = false
    async function load() {
      try {
        const token = await getAccessToken()
        if (!token) return
        const res = await fetch('/api/v1/users/me/polymarket/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const body = (await res.json()) as { items?: PolymarketNotification[] }
        if (!cancelled) setItems(body.items ?? [])
      } catch {
        /* silent */
      }
    }
    void load()
    const id = setInterval(load, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [authenticated, getAccessToken])

  // Chiudi dropdown su click outside
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  async function handleDismiss(id: number) {
    setItems((prev) => prev.filter((n) => n.id !== id))
    try {
      const token = await getAccessToken()
      if (!token) return
      await fetch('/api/v1/users/me/polymarket/notifications', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: [String(id)] }),
      })
    } catch {
      /* optimistic — ignore */
    }
  }

  async function handleDismissAll() {
    if (items.length === 0) return
    const ids = items.map((n) => String(n.id))
    setItems([])
    try {
      const token = await getAccessToken()
      if (!token) return
      await fetch('/api/v1/users/me/polymarket/notifications', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      })
    } catch {
      /* silent */
    }
  }

  const count = items.length

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label="Notifiche"
        onClick={() => setOpen((v) => !v)}
        style={{ ...iconBtnStyle, display: 'flex', position: 'relative' }}
      >
        <Bell size={15} />
        {count > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              minWidth: 14,
              height: 14,
              padding: '0 3px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-danger)',
              color: '#fff',
              fontSize: 9,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 320,
            maxHeight: 420,
            overflowY: 'auto',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            zIndex: 100,
          }}
        >
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderBottom: '1px solid var(--color-border-subtle)',
            }}
          >
            <span style={{ fontSize: 'var(--font-sm)', fontWeight: 700 }}>
              Notifiche {count > 0 && `(${count})`}
            </span>
            {count > 0 && (
              <button
                type="button"
                onClick={handleDismissAll}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 'var(--font-xs)',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                }}
              >
                Pulisci tutte
              </button>
            )}
          </header>

          {count === 0 ? (
            <div
              style={{
                padding: '24px 12px',
                textAlign: 'center',
                fontSize: 'var(--font-sm)',
                color: 'var(--color-text-muted)',
              }}
            >
              Nessuna notifica
            </div>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {items.map((n) => (
                <li key={n.id}>
                  <NotificationRow notification={n} onDismiss={() => handleDismiss(n.id)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function NotificationRow({
  notification,
  onDismiss,
}: {
  notification: PolymarketNotification
  onDismiss: () => void
}) {
  const Icon =
    notification.typeLabel === 'fill'
      ? CheckCircle2
      : notification.typeLabel === 'cancellation'
        ? XCircle
        : Award
  const color =
    notification.typeLabel === 'fill'
      ? 'var(--color-success)'
      : notification.typeLabel === 'cancellation'
        ? 'var(--color-warning)'
        : 'var(--color-cta)'
  const label =
    notification.typeLabel === 'fill'
      ? 'Ordine eseguito'
      : notification.typeLabel === 'cancellation'
        ? 'Ordine cancellato'
        : notification.typeLabel === 'market_resolved'
          ? 'Mercato risolto — redeem disponibile'
          : 'Notifica'
  const time = notification.timestamp
    ? new Date(notification.timestamp * 1000).toLocaleString('it-IT', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 12px',
        borderBottom: '1px solid var(--color-border-subtle)',
      }}
    >
      <Icon size={16} style={{ color, flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--font-sm)', fontWeight: 600 }}>{label}</div>
        {time && (
          <div
            style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-muted)',
              marginTop: 2,
            }}
          >
            {time}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Rimuovi"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          padding: 2,
          display: 'flex',
          flexShrink: 0,
        }}
      >
        <X size={12} />
      </button>
    </div>
  )
}
