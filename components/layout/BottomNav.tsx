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
    <nav
      className="md:hidden flex"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--color-border-default)',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom)',
        /* GPU layer promotion — previene jitter durante scroll su mobile */
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
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
