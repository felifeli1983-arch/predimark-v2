'use client'

import { Bell, Gift, Sun, Moon, Wallet, TrendingUp, Star } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import type { AuthUser } from '@/lib/hooks/useAuth'
import { useThemeStore } from '@/lib/stores/themeStore'
import { useBalance } from '@/lib/stores/useBalance'
import { ProfileDropdown } from './ProfileDropdown'
import { RealDemoToggle } from './RealDemoToggle'

interface Props {
  ready: boolean
  authenticated: boolean
  user: AuthUser | null
  login: () => void
  logout: () => void
}

export function HeaderActions({ ready, authenticated, user, login, logout }: Props) {
  // theme + isDemo dal Zustand store globale (persiste in localStorage)
  const { theme, toggleTheme, isDemo, toggleDemo } = useThemeStore()
  // Balance dallo store (sync via BalanceHydrator)
  const usdcBalance = useBalance((s) => s.usdcBalance)
  const demoBalance = useBalance((s) => s.demoBalance)
  const realPortfolioValue = useBalance((s) => s.realPortfolioValue)
  const demoPortfolioValue = useBalance((s) => s.demoPortfolioValue)
  const cashAvailable = isDemo ? demoBalance : usdcBalance
  const portfolioValue = isDemo ? demoPortfolioValue : realPortfolioValue
  const accent = isDemo ? 'var(--color-warning)' : 'var(--color-cta)'

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
          style={{ gap: 8, marginRight: '6px', alignItems: 'center' }}
        >
          <Link href="/me/positions" style={{ textDecoration: 'none' }} aria-label="Apri portfolio">
            <BalancePill
              label="Portfolio"
              icon={<TrendingUp size={13} style={{ color: accent }} />}
              value={portfolioValue}
              isDemo={isDemo}
            />
          </Link>
          <Link href="/me/wallet" style={{ textDecoration: 'none' }} aria-label="Apri wallet">
            <BalancePill
              label="Contanti"
              icon={<Wallet size={13} style={{ color: accent }} />}
              value={cashAvailable}
              isDemo={isDemo}
            />
          </Link>
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

      {authenticated && (
        <Link
          href="/watchlist"
          aria-label="Watchlist"
          className="hidden md:flex"
          style={{
            flexShrink: 0,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-tertiary)',
            padding: '6px',
            borderRadius: '6px',
            alignItems: 'center',
            textDecoration: 'none',
          }}
        >
          <Star size={15} />
        </Link>
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

      {authenticated && <RealDemoToggle isDemo={isDemo} onToggle={toggleDemo} />}

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

/** Pill compatto per Portfolio o Contanti — larghezza fissa, niente shift al toggle DEMO/REAL. */
function BalancePill({
  label,
  icon,
  value,
  isDemo,
}: {
  label: string
  icon: ReactNode
  value: number
  isDemo: boolean
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 10px',
        borderRadius: 8,
        background: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border-subtle)',
        minWidth: 130,
        justifyContent: 'center',
      }}
      aria-label={`${label} ${isDemo ? 'demo' : 'reale'} ${value.toFixed(2)} USDC`}
    >
      {icon}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span
          style={{
            fontSize: 9,
            color: 'var(--color-text-muted)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            lineHeight: 1,
            fontWeight: 600,
          }}
        >
          {label}
        </span>
        <strong
          style={{
            fontSize: 12,
            color: isDemo ? 'var(--color-warning)' : 'var(--color-text-primary)',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          ${value.toFixed(2)}
        </strong>
      </div>
    </div>
  )
}
