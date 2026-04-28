import type { ReactNode } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { MeSubnav } from '@/components/me/MeSubnav'

/**
 * Layout `/me/*` con sub-navigation tab (Watchlist · Positions · History).
 * Server component shell — la subnav e il contenuto delle pagine sono client.
 */
export default function MeLayout({ children }: { children: ReactNode }) {
  return (
    <PageContainer>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: '12px var(--layout-padding-x) 0',
          minWidth: 0,
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        <MeSubnav />
        {children}
      </div>
    </PageContainer>
  )
}
