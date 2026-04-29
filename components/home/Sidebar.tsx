'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useBalance } from '@/lib/stores/useBalance'
import { SidebarPortfolio } from './SidebarPortfolio'
import { SidebarSignals } from './SidebarSignals'
import { SidebarActivity } from './SidebarActivity'
import { SidebarHotNow } from './SidebarHotNow'
import { SidebarPositions } from './SidebarPositions'
import { SidebarNews } from './SidebarNews'

/**
 * Sidebar adattiva (Doc 4 — 3 stati):
 *  Stato 1 — Guest:        Demo CTA → Signals → HotNow → News → Activity
 *  Stato 2 — Logged no $:  Portfolio (deposit-cta) → Signals → Posizioni (empty) → HotNow → Activity
 *  Stato 3 — Logged + $:   Portfolio (active) → Signals → Posizioni → HotNow → Activity
 *
 * Watchlist è ora separata su /watchlist (icona ⭐ in header desktop, tab in
 * BottomNav mobile). La sidebar mostra invece le top 5 posizioni aperte.
 *
 * Visibilità gestita dal PageContainer parent (hidden lg:block).
 * MobileSidebarRails copre il caso mobile + tablet portrait (<1024px).
 */
export function Sidebar() {
  const { authenticated, ready, login } = useAuth()
  const usdcBalance = useBalance((s) => s.usdcBalance)
  const demoBalance = useBalance((s) => s.demoBalance)
  const realPortfolioValue = useBalance((s) => s.realPortfolioValue)
  const demoPortfolioValue = useBalance((s) => s.demoPortfolioValue)
  // hasDeposit = ha cash o posizioni in REAL o DEMO. Default demoBalance=10000 → user è subito "active".
  const hasDeposit =
    usdcBalance > 0 || realPortfolioValue > 0 || demoBalance > 0 || demoPortfolioValue > 0

  const state: 'guest' | 'logged-no-deposit' | 'logged-active' = !ready
    ? 'guest'
    : !authenticated
      ? 'guest'
      : hasDeposit
        ? 'logged-active'
        : 'logged-no-deposit'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
      }}
    >
      {state === 'guest' && (
        <>
          <GuestDemoCta onLogin={login} />
          <SidebarSignals />
          <SidebarHotNow />
          <SidebarNews />
          <SidebarActivity />
        </>
      )}

      {state === 'logged-no-deposit' && (
        <>
          <SidebarPortfolio mode="deposit-cta" />
          <SidebarSignals />
          <SidebarPositions />
          <SidebarHotNow />
          <SidebarActivity />
        </>
      )}

      {state === 'logged-active' && (
        <>
          <SidebarPortfolio mode="active" />
          <SidebarSignals />
          <SidebarPositions />
          <SidebarHotNow />
          <SidebarActivity />
        </>
      )}
    </div>
  )
}

function GuestDemoCta({ onLogin }: { onLogin: () => void }) {
  return (
    <section
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-cta)',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
      }}
    >
      <h3
        style={{
          margin: 0,
          fontSize: 'var(--font-base)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: 4,
        }}
      >
        Try Demo Mode
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          marginBottom: 10,
          lineHeight: 1.5,
        }}
      >
        Esplora con $10k paper money — nessun rischio, nessuna registrazione.
      </p>
      <button
        type="button"
        onClick={onLogin}
        style={{
          width: '100%',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-cta)',
          color: '#fff',
          border: 'none',
          fontSize: 'var(--font-sm)',
          fontWeight: 600,
          cursor: 'pointer',
          marginBottom: 6,
        }}
      >
        Sign in
      </button>
      <Link
        href="/?demo=1"
        style={{
          display: 'block',
          textAlign: 'center',
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-secondary)',
          textDecoration: 'none',
        }}
      >
        Try Demo →
      </Link>
    </section>
  )
}
