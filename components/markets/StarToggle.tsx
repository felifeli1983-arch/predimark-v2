'use client'

import { Star } from 'lucide-react'

interface Props {
  isFavorite: boolean
  onToggle: () => void
  size?: number
  /** Per accessibility */
  marketLabel?: string
}

/**
 * Toggle stellina watchlist (Polymarket-style).
 *
 * MA4.1-BIS: solo UI placeholder — onToggle è uno stub `console.warn`.
 * Wiring reale a `useWatchlist` store + tabella DB `watchlist` arriva in MA4.2.
 */
export function StarToggle({ isFavorite, onToggle, size = 14, marketLabel }: Props) {
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
        onToggle()
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

/**
 * TODO MA4.2: rimpiazzare con hook reale `useWatchlist().toggle(marketId)`.
 * Esposto qui come placeholder — ogni card lo riusa.
 */
export function watchlistStubToggle(marketId: string) {
  console.warn('[Watchlist stub MA4.2]', marketId)
}
