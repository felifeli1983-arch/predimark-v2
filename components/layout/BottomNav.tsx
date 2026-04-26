'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Zap, ShoppingCart, MoreHorizontal } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/signals', icon: Zap, label: 'Signals' },
  { href: '/slip', icon: ShoppingCart, label: 'Slip' },
  { href: '/more', icon: MoreHorizontal, label: 'More' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    /*
     * PWA: BottomNav è in flow nel flex column dell'app shell.
     * NON usa position:fixed — è sempre in fondo perché il flex column
     * spinge <main> a riempire lo spazio rimasto. Zero jank garantito.
     * md:hidden nasconde su desktop (≥768px).
     */
    <nav
      className="md:hidden"
      style={{
        flexShrink: 0,
        display: 'flex',
        background: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--color-border-default)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 4px',
              gap: '4px',
              textDecoration: 'none',
              color: isActive ? 'var(--color-cta)' : 'var(--color-text-muted)',
              transition: 'color 150ms',
            }}
          >
            <Icon size={20} />
            <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 400 }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
