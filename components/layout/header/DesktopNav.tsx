'use client'

import Link from 'next/link'
import { NAV_LINKS } from './nav-links'

interface Props {
  pathname: string | null
}

export function DesktopNav({ pathname }: Props) {
  return (
    <nav className="hidden md:flex" style={{ gap: '2px', marginLeft: '12px', flexShrink: 0 }}>
      {NAV_LINKS.map((link) => {
        const active = pathname?.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              padding: '5px 10px',
              borderRadius: '7px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              background: active ? 'var(--color-bg-tertiary)' : 'transparent',
              transition: 'color 150ms, background 150ms',
            }}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
