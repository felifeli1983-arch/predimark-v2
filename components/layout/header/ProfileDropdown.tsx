'use client'

import Link from 'next/link'
import { ChevronDown, LogOut, Activity, History, Wallet, Star, Settings } from 'lucide-react'
import { useEffect, useRef, useState, type ComponentType, type SVGProps } from 'react'
import type { AuthUser } from '@/lib/hooks/useAuth'

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>

interface MenuLink {
  href: string
  icon: IconType
  label: string
}

const MENU_LINKS: MenuLink[] = [
  { href: '/me/positions', icon: Activity, label: 'Posizioni' },
  { href: '/me/history', icon: History, label: 'Storico' },
  { href: '/me/wallet', icon: Wallet, label: 'Wallet' },
  { href: '/watchlist', icon: Star, label: 'Watchlist' },
  { href: '/me/settings', icon: Settings, label: 'Settings' },
]

interface Props {
  user: AuthUser | null
  onLogout: () => void
}

export function ProfileDropdown({ user, onLogout }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayName =
    user?.email ?? (user?.walletAddress ? `${user.walletAddress.slice(0, 6)}…` : 'Profile')

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '7px',
          padding: '5px 8px',
          cursor: 'pointer',
          color: 'var(--color-text-primary)',
          fontSize: '12px',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'var(--color-cta)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 700,
            color: '#fff',
            flexShrink: 0,
          }}
        >
          {(user?.email?.[0] ?? 'U').toUpperCase()}
        </div>
        <span
          className="hidden md:inline"
          style={{
            maxWidth: '90px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayName}
        </span>
        <ChevronDown size={11} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: '10px',
            minWidth: '200px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          {/* Header con email/wallet — solo display, niente click */}
          {user && (
            <div
              style={{
                padding: '10px 16px 8px',
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                borderBottom: '1px solid var(--color-border-subtle)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {displayName}
            </div>
          )}

          {MENU_LINKS.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
                fontSize: '13px',
              }}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}

          <div style={{ height: '1px', background: 'var(--color-border-subtle)' }} />
          <button
            onClick={() => {
              onLogout()
              setOpen(false)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 16px',
              color: 'var(--color-danger)',
              background: 'none',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
