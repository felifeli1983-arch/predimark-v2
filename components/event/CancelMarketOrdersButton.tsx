'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Loader2, XCircle } from 'lucide-react'
import { fetchOpenOrders, deleteMarketOrders } from '@/lib/api/orders-client'

interface Props {
  /** Tutti i conditionId dei markets di questo evento (binary=1, multi=N). */
  conditionIds: string[]
}

/**
 * Bottone "Annulla ordini su questo evento" — Doc Cancel Order →
 * cancelMarketOrders. Si nasconde se l'utente non ha ordini live su
 * nessuno dei markets dell'evento.
 *
 * Per eventi multi-outcome (N markets con conditionId diversi) itera
 * cancelMarketOrders su ogni conditionId in parallelo.
 */
export function CancelMarketOrdersButton({ conditionIds }: Props) {
  const { ready, authenticated, getAccessToken } = usePrivy()
  const [count, setCount] = useState(0)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!ready || !authenticated || conditionIds.length === 0) return
    let cancelled = false
    async function load() {
      try {
        const token = await getAccessToken()
        if (!token) return
        const results = await Promise.all(
          conditionIds.map((cid) => fetchOpenOrders(token, { market: cid }).catch(() => null))
        )
        if (cancelled) return
        const total = results.reduce((acc, r) => acc + (r?.items.length ?? 0), 0)
        setCount(total)
      } catch {
        /* silent — fallback no badge */
      }
    }
    void load()
    const id = setInterval(load, 30_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [ready, authenticated, conditionIds, getAccessToken])

  if (!authenticated || count === 0) return null

  async function handleCancel() {
    if (busy) return
    if (!confirm(`Annullare ${count} ordin${count === 1 ? 'e' : 'i'} su questo evento?`)) return
    setBusy(true)
    try {
      const token = await getAccessToken()
      if (!token) return
      await Promise.all(
        conditionIds.map((cid) => deleteMarketOrders(token, { market: cid }).catch(() => null))
      )
      setCount(0)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={busy}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 'var(--radius-md)',
        background: 'transparent',
        border: '1px solid var(--color-danger)',
        color: 'var(--color-danger)',
        fontSize: 'var(--font-xs)',
        fontWeight: 700,
        cursor: busy ? 'wait' : 'pointer',
      }}
    >
      {busy ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
      Annulla {count} ordin{count === 1 ? 'e' : 'i'} su questo evento
    </button>
  )
}
