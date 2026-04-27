import type { ReactNode } from 'react'

interface Props {
  /** Contenuto principale (riempie la colonna main, full-width su mobile) */
  children: ReactNode
  /** Sidebar sticky destra. Visibile solo ≥768px. Omettila per pagine senza sidebar. */
  sidebar?: ReactNode
}

/**
 * Cornice unica per tutte le pagine prod (Home, Event, Sport hub, Profile, …).
 * Tutti i numeri (max-width, sidebar width, gap, padding) vivono in
 * `globals.css` come CSS vars `--layout-*` ed sono editabili in un posto solo.
 *
 * Comportamento responsive:
 *  - Mobile (<768px): 1 colonna full-width, sidebar nascosta
 *    (le pagine inseriscono moduli mobile inline tipo MobileSidebarRails)
 *  - Tablet/Desktop (≥768px): main 1fr + sidebar 320px sticky
 *  - >1440px: contenuto cappato e centrato
 */
export function PageContainer({ children, sidebar }: Props) {
  return (
    <div className="page-grid">
      <main style={{ minWidth: 0 }}>{children}</main>
      {sidebar && (
        <aside
          className="hidden md:block"
          style={{
            alignSelf: 'start',
            position: 'sticky',
            top: 'var(--layout-sidebar-top)',
            padding: '12px var(--layout-padding-x) 0 0',
          }}
        >
          {sidebar}
        </aside>
      )}
    </div>
  )
}
