'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useCallback } from 'react'
import { useWatchlist } from '@/lib/stores/useWatchlist'
import {
  fetchWatchlist,
  postWatchlistAdd,
  deleteWatchlist,
  type AddWatchlistPayload,
} from '@/lib/api/watchlist-client'

/**
 * Hook che orchestra Privy token + API watchlist + store con optimistic update.
 *
 * - `hydrate`: scarica la watchlist server-side e popola lo store
 * - `add` / `remove`: optimistic update + chiamata API + rollback in caso di errore
 * - `toggle`: comoda combinazione add/remove
 */
export function useWatchlistActions() {
  const { getAccessToken, authenticated } = usePrivy()
  const setWatched = useWatchlist((s) => s.setWatched)
  const markAdded = useWatchlist((s) => s.markAdded)
  const markRemoved = useWatchlist((s) => s.markRemoved)

  const hydrate = useCallback(async () => {
    if (!authenticated) return
    const token = await getAccessToken()
    if (!token) return
    try {
      const items = await fetchWatchlist(token)
      setWatched(items.map((i) => i.polymarketMarketId).filter(Boolean))
    } catch (err) {
      console.warn('[watchlist] hydrate failed', err)
    }
  }, [authenticated, getAccessToken, setWatched])

  const add = useCallback(
    async (payload: AddWatchlistPayload) => {
      if (!authenticated) return
      const token = await getAccessToken()
      if (!token) return
      // Optimistic
      markAdded(payload.polymarketMarketId)
      try {
        await postWatchlistAdd(token, payload)
      } catch (err) {
        console.warn('[watchlist] add failed, rollback', err)
        markRemoved(payload.polymarketMarketId)
      }
    },
    [authenticated, getAccessToken, markAdded, markRemoved]
  )

  const remove = useCallback(
    async (polymarketMarketId: string) => {
      if (!authenticated) return
      const token = await getAccessToken()
      if (!token) return
      // Optimistic
      markRemoved(polymarketMarketId)
      try {
        await deleteWatchlist(token, polymarketMarketId)
      } catch (err) {
        console.warn('[watchlist] remove failed, rollback', err)
        markAdded(polymarketMarketId)
      }
    },
    [authenticated, getAccessToken, markAdded, markRemoved]
  )

  const toggle = useCallback(
    async (payload: AddWatchlistPayload) => {
      if (useWatchlist.getState().isWatching(payload.polymarketMarketId)) {
        await remove(payload.polymarketMarketId)
      } else {
        await add(payload)
      }
    },
    [add, remove]
  )

  return { hydrate, add, remove, toggle }
}
