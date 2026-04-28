import Link from 'next/link'
import { Star } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { WatchlistList } from '@/components/watchlist/WatchlistList'

/**
 * Page `/watchlist` — lista dei mercati seguiti dall'utente (preferiti).
 *
 * Standalone, separata da `/me/*` (che è dedicato all'account di trading:
 * posizioni, storico, wallet). La watchlist è solo un "follow list"
 * senza commitment finanziario.
 */
export default function WatchlistPage() {
  return (
    <PageContainer>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: '12px var(--layout-padding-x) 0',
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Star size={20} style={{ color: 'var(--color-warning)' }} />
          <h1
            style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}
          >
            Watchlist
          </h1>
        </header>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          I mercati che stai seguendo. Click sulla stellina di una card per aggiungere o rimuovere.{' '}
          <Link
            href="/"
            style={{ color: 'var(--color-cta)', textDecoration: 'none', fontWeight: 600 }}
          >
            Sfoglia mercati →
          </Link>
        </p>
        <WatchlistList />
      </div>
    </PageContainer>
  )
}
