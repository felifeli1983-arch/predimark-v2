'use client'

import { useEffect, useRef } from 'react'
import { usePrivy } from '@privy-io/react-auth'

const HEARTBEAT_INTERVAL_MS = 5_000

/**
 * Hook React: tiene attiva la session Polymarket pingando heartbeat
 * ogni 5s. Doc Orders Overview: "If a valid heartbeat is not received
 * within 10 seconds, all of your open orders will be cancelled".
 *
 * Activate solo quando `enabled = true` (es. utente sta visualizzando
 * /me/orders e ha open orders > 0). Quando il componente unmount o
 * enabled diventa false, ferma il polling.
 *
 * Limitation: protegge gli ordini SOLO mentre il browser tab è aperto
 * sulla pagina. Per heartbeat 24/7 server-side serve un worker
 * dedicato (out of scope MVP).
 */
export function useHeartbeat(enabled: boolean): void {
  const { getAccessToken } = usePrivy()
  const heartbeatIdRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    async function ping() {
      if (cancelled) return
      try {
        const token = await getAccessToken()
        if (!token) return
        const res = await fetch('/api/v1/users/me/heartbeat', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ heartbeatId: heartbeatIdRef.current }),
        })
        if (res.ok) {
          const data = (await res.json()) as { heartbeatId?: string }
          heartbeatIdRef.current = data.heartbeatId
        } else if (res.status === 400) {
          // Heartbeat id stale — il server ritorna il nuovo nel body
          const body = (await res.json()) as {
            heartbeatId?: string
            error?: { message?: string }
          }
          if (body.heartbeatId) heartbeatIdRef.current = body.heartbeatId
        }
      } catch {
        /* silenzioso — retry next tick */
      }
    }

    void ping() // immediate first ping
    const id = setInterval(ping, HEARTBEAT_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [enabled, getAccessToken])
}
