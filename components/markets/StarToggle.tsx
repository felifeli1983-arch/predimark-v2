'use client'

import { Star } from 'lucide-react'
import { useWatchlist } from '@/lib/stores/useWatchlist'
import { useWatchlistActions } from '@/lib/hooks/useWatchlistActions'
import type { AddWatchlistPayload } from '@/lib/api/watchlist-client'

interface Props {
  /** Payload completo per add/remove sull'API. */
  payload: AddWatchlistPayload
  size?: number
  /** Per accessibility */
  marketLabel?: string
}

/**
 * Toggle stellina watchlist (Polymarket-style).
 *
 * Letture reattive da `useWatchlist` store. Toggle delegato a
 * `useWatchlistActions` che gestisce Privy token + API + optimistic.
 *
 * Se l'utente non è autenticato il click non fa nulla (silently no-op).
 */
export function StarToggle({ payload, size = 14, marketLabel }: Props) {
  const isFavorite = useWatchlist((s) => s.watched.has(payload.polymarketMarketId))
  const { toggle } = useWatchlistActions()

  return (
    <button
      type="button"
      aria-label={
        marketLabel
          ? isFavorite
            ? `Rimuovi ${marketLabel} dalla watchlist`
            : `Aggiungi ${marketLabel} alla watchlist`
          : isFavorite
            ? 'Rimuovi dalla watchlist'
            : 'Aggiungi alla watchlist'
      }
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void toggle(payload)
      }}
      style={{
        background: 'transparent',
        border: 'none',
        padding: 4,
        cursor: 'pointer',
        color: isFavorite ? 'var(--color-warning)' : 'var(--color-text-muted)',
        display: 'inline-flex',
        alignItems: 'center',
        flexShrink: 0,
      }}
    >
      <Star
        size={size}
        fill={isFavorite ? 'var(--color-warning)' : 'none'}
        strokeWidth={isFavorite ? 0 : 1.8}
      />
    </button>
  )
}
