import type { ReactNode } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { MeSubnav } from '@/components/me/MeSubnav'
import { RedeemAutoPrompt } from '@/components/me/RedeemAutoPrompt'

// /me/* tutte richiedono autenticazione e Privy hooks → niente prerender SSG.
export const dynamic = 'force-dynamic'

/**
 * Layout `/me/*` con sub-navigation tab (Watchlist · Positions · History).
 * Server component shell — la subnav e il contenuto delle pagine sono client.
 */
/**
 * Account trading pages — colonna centrale stretta (max 720px) come pattern
 * "settings/profile" canonico. Niente full-width 1440px che farebbe diventare
 * card e bottoni giganti su monitor desktop.
 */
export default function MeLayout({ children }: { children: ReactNode }) {
  return (
    <PageContainer>
      <div
        style={{
          width: '100%',
          maxWidth: 720,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: '12px var(--layout-padding-x) 0',
          minWidth: 0,
          overflowX: 'hidden',
        }}
      >
        <MeSubnav />
        {/* Auto-prompt redeem: appare in modal se ci sono vincite non
            claimate. Non-intrusive — single dismiss per session. */}
        <RedeemAutoPrompt />
        {children}
      </div>
    </PageContainer>
  )
}
