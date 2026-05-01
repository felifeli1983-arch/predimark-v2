'use client'

import { useEffect, useRef } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import {
  fetchUserClobCreds,
  subscribeToUserChannel,
  type UserChannelEvent,
  type UserCreds,
} from '@/lib/ws/user-channel'

/**
 * Hook React per il Polymarket User Channel WebSocket.
 *
 * Registra `callback` su ogni evento ORDER/TRADE dell'utente loggato.
 * Le creds vengono fetchate al mount + cached per la sessione (no
 * re-fetch ad ogni render). Cleanup automatico al unmount.
 *
 * Usage:
 *   useUserChannel((event) => {
 *     if (event.event_type === 'order' && event.type === 'CANCELLATION') {
 *       refresh() // reload list
 *     }
 *   })
 *
 * Se utente non loggato → no-op.
 * Se utente non onboarded a Polymarket → no-op (creds null).
 */
export function useUserChannel(
  callback: (event: UserChannelEvent) => void,
  /** Filtro markets opzionale (vuoto = TUTTI i markets dell'utente). */
  markets: string[] = []
): void {
  const { authenticated, getAccessToken } = usePrivy()
  // Ref per il callback per evitare re-subscribe ad ogni render
  const cbRef = useRef(callback)
  useEffect(() => {
    cbRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!authenticated) return
    let cancelled = false
    let unsubscribe: (() => void) | null = null

    async function setup(): Promise<void> {
      const token = await getAccessToken()
      if (!token || cancelled) return
      const creds: UserCreds | null = await fetchUserClobCreds(token)
      if (!creds || cancelled) return
      unsubscribe = subscribeToUserChannel(creds, markets, (event) => {
        cbRef.current(event)
      })
    }

    void setup()

    return () => {
      cancelled = true
      unsubscribe?.()
    }
    // markets array stable required from caller — usa useMemo se dinamico
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, getAccessToken, markets.join(',')])
}
