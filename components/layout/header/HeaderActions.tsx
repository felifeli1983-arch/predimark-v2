'use client'

import { Bell, Gift, Sun, Moon } from 'lucide-react'
import type { AuthUser } from '@/lib/hooks/useAuth'
import { ProfileDropdown } from './ProfileDropdown'
import { RealDemoToggle } from './RealDemoToggle'

interface Props {
  ready: boolean
  authenticated: boolean
  user: AuthUser | null
  theme: 'dark' | 'light'
  toggleTheme: () => void
  login: () => void
  logout: () => void
  isDemo: boolean
  onDemoToggle: () => void
}

export function HeaderActions({
  ready,
  authenticated,
  user,
  theme,
  toggleTheme,
  login,
  logout,
  isDemo,
  onDemoToggle,
}: Props) {
  return (
    <div
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginLeft: '8px',
      }}
    >
      {authenticated && (
        <div
          className="hidden lg:flex"
          style={{ gap: '10px', marginRight: '6px', alignItems: 'center' }}
        >
          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            Portfolio{' '}
            <strong
              style={{ color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}
            >
              $0.00
            </strong>
          </span>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            Cash{' '}
            <strong
              style={{ color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}
            >
              $0.00
            </strong>
          </span>
        </div>
      )}

      {authenticated && (
        <button
          className="hidden md:flex"
          style={{
            flexShrink: 0,
            background: 'var(--color-cta)',
            color: '#fff',
            border: 'none',
            borderRadius: '7px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            alignItems: 'center',
          }}
        >
          Deposit
        </button>
      )}

      <button
        className="hidden md:flex"
        onClick={toggleTheme}
        aria-label="Toggle tema"
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-tertiary)',
          padding: '6px',
          borderRadius: '6px',
          alignItems: 'center',
        }}
      >
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {authenticated && (
        <button
          className="hidden md:flex"
          aria-label="Referral"
          style={{
            flexShrink: 0,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-tertiary)',
            padding: '6px',
            borderRadius: '6px',
            alignItems: 'center',
          }}
        >
          <Gift size={15} />
        </button>
      )}

      <button
        aria-label="Notifiche"
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-tertiary)',
          padding: '6px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <Bell size={15} />
      </button>

      {authenticated && <RealDemoToggle isDemo={isDemo} onToggle={onDemoToggle} />}

      {!ready ? (
        <div
          style={{
            flexShrink: 0,
            width: '72px',
            height: '30px',
            borderRadius: '7px',
            background: 'var(--color-bg-tertiary)',
          }}
        />
      ) : authenticated ? (
        <ProfileDropdown user={user} onLogout={logout} />
      ) : (
        <button
          onClick={login}
          style={{
            flexShrink: 0,
            background: 'var(--color-cta)',
            color: '#fff',
            border: 'none',
            borderRadius: '7px',
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Sign in
        </button>
      )}
    </div>
  )
}
