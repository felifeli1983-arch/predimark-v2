'use client'

import { create } from 'zustand'

interface WatchlistState {
  /** Set di polymarket_market_id seguiti dall'utente. */
  watched: Set<string>
  /** True dopo che almeno una `hydrate` è stata completata. */
  hydrated: boolean
}

interface WatchlistActions {
  /** Sostituisce il set (usato dopo `fetchWatchlist`). Marca hydrated=true. */
  setWatched: (ids: string[]) => void
  /** Aggiunge optimistic. */
  markAdded: (polymarketMarketId: string) => void
  /** Rimuove optimistic. */
  markRemoved: (polymarketMarketId: string) => void
  /** Reset (usato dopo logout). */
  reset: () => void
  /** Selettore: true se questo market è nella watchlist. */
  isWatching: (polymarketMarketId: string) => boolean
}

export type WatchlistStore = WatchlistState & WatchlistActions

/**
 * Pure store: state + mutator sincroni. Le chiamate API live in
 * `useWatchlistActions` (hook React) che orchestrano Privy token +
 * `lib/api/watchlist-client.ts` + optimistic update + rollback.
 */
export const useWatchlist = create<WatchlistStore>()((set, get) => ({
  watched: new Set<string>(),
  hydrated: false,

  setWatched: (ids) => set({ watched: new Set(ids), hydrated: true }),

  markAdded: (id) =>
    set((state) => {
      const next = new Set(state.watched)
      next.add(id)
      return { watched: next }
    }),

  markRemoved: (id) =>
    set((state) => {
      if (!state.watched.has(id)) return state
      const next = new Set(state.watched)
      next.delete(id)
      return { watched: next }
    }),

  reset: () => set({ watched: new Set(), hydrated: false }),

  isWatching: (id) => get().watched.has(id),
}))
