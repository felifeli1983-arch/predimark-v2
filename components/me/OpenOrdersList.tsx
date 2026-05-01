'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { ListOrdered, Loader2, Trash2, X, Sparkles } from 'lucide-react'

import {
  fetchOpenOrders,
  deleteOrder,
  deleteAllOrders,
  fetchOrderScoring,
  type OpenOrderRow,
} from '@/lib/api/orders-client'
import { useHeartbeat } from '@/lib/hooks/useHeartbeat'
import { useUserChannel } from '@/lib/hooks/useUserChannel'

/**
 * Lista ordini live (resting on book) con bottone Cancel per riga.
 * Polymarket "Order Lifecycle" doc: ordini GTC restano fino a match
 * o cancel; GTD scadono auto. Cancel idempotente (ordine già matched
 * → 409 gracefully).
 *
 * REAL-TIME PUSH via WS User Channel (Doc WebSocket User Channel) +
 * fallback polling 5min come safety net se WS si disconnette.
 */
const FALLBACK_POLL_MS = 5 * 60 * 1000

export function OpenOrdersList() {
  const { ready, authenticated, getAccessToken, login } = usePrivy()
  const [items, setItems] = useState<OpenOrderRow[]>([])
  const [reservedSize, setReservedSize] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [scoring, setScoring] = useState<Record<string, boolean>>({})

  // Heartbeat ogni 5s mentre l'utente ha open orders attivi.
  // Senza questo, Polymarket auto-cancella tutti gli orders dopo 10s
  // di inattività (Doc Orders Overview).
  useHeartbeat(authenticated && items.length > 0)

  const load = useCallback(async () => {
    try {
      const token = await getAccessToken()
      if (!token) return
      const data = await fetchOpenOrders(token)
      setItems(data.items)
      setReservedSize(data.meta.reservedSize)
      setError(null)
      const ids = data.items.map((o) => o.id)
      if (ids.length > 0) {
        const map = await fetchOrderScoring(token, ids)
        setScoring(map)
      } else {
        setScoring({})
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    } finally {
      setLoading(false)
    }
  }, [getAccessToken])

  useEffect(() => {
    if (!ready || !authenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    void load()
    const id = setInterval(load, FALLBACK_POLL_MS)
    return () => clearInterval(id)
  }, [ready, authenticated, load])

  // Push real-time: ogni order/trade event refetch list (server è source of truth)
  useUserChannel((event) => {
    if (event.event_type === 'order' || event.event_type === 'trade') {
      void load()
    }
  })

  async function handleCancel(orderId: string) {
    if (cancellingId) return
    setCancellingId(orderId)
    try {
      const token = await getAccessToken()
      if (!token) throw new Error('Sessione scaduta')
      await deleteOrder(token, orderId)
      // Optimistic remove (il polling 30s farebbe sync ma sparisce subito).
      setItems((prev) => prev.filter((o) => o.id !== orderId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore cancellazione')
    } finally {
      setCancellingId(null)
    }
  }

  async function handleCancelAll() {
    if (cancellingId === 'ALL') return
    setCancellingId('ALL')
    try {
      const token = await getAccessToken()
      if (!token) throw new Error('Sessione scaduta')
      // 1-call cancelAll() del CLOB (Doc Cancel Order). Più veloce e
      // atomico del loop precedente. Optimistic clear della lista; il
      // polling 30s sincronizza eventuali ordini residui (es. matched
      // tra request e response).
      await deleteAllOrders(token)
      setItems([])
      setScoring({})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore')
    } finally {
      setCancellingId(null)
    }
  }

  if (!ready || loading) return <SkeletonList />
  if (!authenticated) return <LoginPrompt onLogin={login} />

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nessun ordine attivo"
        subtitle="Quando piazzi un ordine limite resterà qui finché non viene matched o cancellato."
      />
    )
  }

  return (
    <>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div>
          <div style={{ fontSize: 'var(--font-md)', fontWeight: 700 }}>
            {items.length} {items.length === 1 ? 'ordine attivo' : 'ordini attivi'}
          </div>
          <div
            style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-muted)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            ${reservedSize.toFixed(2)} riservati
          </div>
        </div>
        {items.length > 1 && (
          <button
            type="button"
            onClick={handleCancelAll}
            disabled={cancellingId !== null}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              color: 'var(--color-danger)',
              border: '1px solid var(--color-danger)',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-xs)',
              fontWeight: 700,
              cursor: cancellingId !== null ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {cancellingId === 'ALL' && <Loader2 size={11} className="animate-spin" />}
            Cancel all
          </button>
        )}
      </header>

      {error && (
        <div
          style={{
            padding: '8px 12px',
            background: 'color-mix(in srgb, var(--color-danger) 10%, transparent)',
            border: '1px solid var(--color-danger)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-xs)',
            color: 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={12} />
          </button>
        </div>
      )}

      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
        {items.map((order) => (
          <li key={order.id}>
            <OrderRow
              order={order}
              onCancel={() => handleCancel(order.id)}
              isCancelling={cancellingId === order.id}
              disabled={cancellingId !== null}
              earningRebate={scoring[order.id] ?? false}
            />
          </li>
        ))}
      </ul>
    </>
  )
}

function OrderRow({
  order,
  onCancel,
  isCancelling,
  disabled,
  earningRebate,
}: {
  order: OpenOrderRow
  onCancel: () => void
  isCancelling: boolean
  disabled: boolean
  earningRebate: boolean
}) {
  const sideColor = order.side === 'BUY' ? 'var(--color-success)' : 'var(--color-danger)'
  const remainingPct = order.originalSize > 0 ? (order.remaining / order.originalSize) * 100 : 100

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 12px',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-sm)',
      }}
    >
      <span
        style={{
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          background: 'color-mix(in srgb, ' + sideColor + ' 15%, transparent)',
          color: sideColor,
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: '0.04em',
          flexShrink: 0,
        }}
      >
        {order.side}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 'var(--font-sm)',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: 'var(--color-text-primary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {order.outcome || 'Outcome'} @ {(order.price * 100).toFixed(2)}¢
          {earningRebate && (
            <span
              title="Maker rebate attivo — questo ordine accumula incentivi liquidity provider"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                padding: '1px 6px',
                borderRadius: 'var(--radius-full)',
                background: 'color-mix(in srgb, var(--color-success) 14%, transparent)',
                color: 'var(--color-success)',
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              <Sparkles size={9} /> REBATE
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: 'var(--font-xs)',
            color: 'var(--color-text-muted)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {order.remaining.toFixed(2)} / {order.originalSize.toFixed(2)} ·{' '}
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {order.orderType}
          </span>
          {remainingPct < 100 && ` · ${(100 - remainingPct).toFixed(0)}% filled`}
        </div>
      </div>

      <button
        type="button"
        onClick={onCancel}
        disabled={disabled}
        aria-label="Cancella ordine"
        style={{
          padding: 6,
          background: 'transparent',
          color: 'var(--color-danger)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-sm)',
          cursor: disabled ? 'wait' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {isCancelling ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
      </button>
    </div>
  )
}

function SkeletonList() {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          style={{
            height: 56,
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-sm)',
          }}
        />
      ))}
    </ul>
  )
}

function LoginPrompt({ onLogin }: { onLogin: () => void }) {
  return (
    <EmptyState
      title="Effettua login per vedere i tuoi ordini"
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
      <ListOrdered
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
