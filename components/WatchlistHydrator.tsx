'use client'

import { useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { useWatchlistActions } from '@/lib/hooks/useWatchlistActions'
import { useWatchlist } from '@/lib/stores/useWatchlist'

/**
 * Monta in RootLayout. Quando l'utente diventa authenticated, scarica
 * la watchlist DB e popola lo store. Al logout resetta.
 *
 * Restituisce null — è un side-effect-only component.
 */
export function WatchlistHydrator() {
  const { authenticated, ready } = usePrivy()
  const { hydrate } = useWatchlistActions()
  const reset = useWatchlist((s) => s.reset)

  useEffect(() => {
    if (!ready) return
    if (authenticated) {
      hydrate()
    } else {
      reset()
    }
  }, [ready, authenticated, hydrate, reset])

  return null
}
