import Link from 'next/link'
import { WatchlistList } from '@/components/watchlist/WatchlistList'

/**
 * Page `/me/watchlist` — lista dei mercati seguiti dall'utente.
 * Layout fornito da `/me/layout.tsx` (subnav + container).
 */
export default function WatchlistPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
      <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
        Click sulla stellina di una card per aggiungere o rimuovere.{' '}
        <Link
          href="/"
          style={{ color: 'var(--color-cta)', textDecoration: 'none', fontWeight: 600 }}
        >
          Sfoglia mercati →
        </Link>
      </p>
      <WatchlistList />
    </div>
  )
}
