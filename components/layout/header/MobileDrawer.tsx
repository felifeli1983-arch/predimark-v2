'use client'

import Link from 'next/link'
import { X, Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/lib/stores/themeStore'
import { NAV_LINKS } from './nav-links'

interface Props {
  open: boolean
  onClose: () => void
  pathname: string | null
}

export function MobileDrawer({ open, onClose, pathname }: Props) {
  const { theme, toggleTheme } = useThemeStore()

  if (!open) return null

  return (
    <div className="md:hidden" style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'var(--color-overlay)' }}
      />

      {/* Pannello */}
      <nav
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '280px',
          background: 'var(--color-bg-secondary)',
          borderRight: '1px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header drawer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 16px 12px',
            borderBottom: '1px solid var(--color-border-subtle)',
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-text-primary)' }}>
            Auktora
          </span>
          <button
            onClick={onClose}
            aria-label="Chiudi menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav links */}
        <div style={{ padding: '8px 12px', flex: 1 }}>
          {NAV_LINKS.map((link) => {
            const active = pathname?.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '11px 12px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  background: active ? 'var(--color-bg-tertiary)' : 'transparent',
                  marginBottom: '2px',
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Footer drawer */}
        <div
          style={{
            padding: '12px 12px 16px',
            borderTop: '1px solid var(--color-border-subtle)',
            flexShrink: 0,
          }}
        >
          <button
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '11px 12px',
              borderRadius: '8px',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              fontSize: '14px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </nav>
    </div>
  )
}
