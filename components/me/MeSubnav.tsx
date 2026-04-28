'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, History, Wallet } from 'lucide-react'

const TABS = [
  { href: '/me/positions', icon: Activity, label: 'Posizioni' },
  { href: '/me/history', icon: History, label: 'Storico' },
  { href: '/me/wallet', icon: Wallet, label: 'Wallet' },
] as const

/**
 * Sub-navigation `/me/*` — link orizzontali con icona + label.
 * La tab attiva ha bordo bottom CTA + colore primario.
 *
 * `/me/*` è dedicato all'account di trading. La Watchlist (preferiti) vive
 * separata su `/watchlist` perché è un "follow list" senza commitment finanziario.
 */
export function MeSubnav() {
  const pathname = usePathname()
  return (
    <nav
      aria-label="Sub-nav profilo"
      style={{
        display: 'flex',
        gap: 4,
        borderBottom: '1px solid var(--color-border-subtle)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      {TABS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 14px',
              fontSize: 'var(--font-base)',
              fontWeight: active ? 700 : 500,
              color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              textDecoration: 'none',
              borderBottom: active ? '2px solid var(--color-cta)' : '2px solid transparent',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'color 150ms',
            }}
          >
            <Icon size={14} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
