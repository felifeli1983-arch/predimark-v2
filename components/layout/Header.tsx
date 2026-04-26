'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, Bell, Gift, ChevronDown, LogOut, User, Sun, Moon, Zap } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useThemeStore } from '@/lib/stores/themeStore'

const NAV_LINKS = [
  { href: '/markets', label: 'Markets' },
  { href: '/signals', label: 'Signals' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/news', label: 'News' },
  { href: '/creator', label: 'Creator' },
]

export function Header() {
  const { ready, authenticated, user, login, logout } = useAuth()
  const { theme, toggleTheme } = useThemeStore()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [isDemo, setIsDemo] = useState(false)

  const displayName =
    user?.email ?? (user?.walletAddress ? `${user.walletAddress.slice(0, 6)}…` : 'Profile')

  return (
    <>
      <header
        style={{
          background: 'var(--color-bg-primary)',
          borderBottom: '1px solid var(--color-border-default)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 24px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* MOBILE: hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
            style={{
              color: 'var(--color-text-secondary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            <Menu size={20} />
          </button>

          {/* LOGO */}
          <Link
            href="/"
            style={{
              fontWeight: 700,
              fontSize: '18px',
              color: 'var(--color-text-primary)',
              textDecoration: 'none',
              letterSpacing: '-0.02em',
              flexShrink: 0,
            }}
          >
            Auktora
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex" style={{ gap: '4px', marginLeft: '8px' }}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: pathname?.startsWith(link.href)
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-secondary)',
                  background: pathname?.startsWith(link.href)
                    ? 'var(--color-bg-tertiary)'
                    : 'transparent',
                  transition: 'color 150ms, background 150ms',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* SEARCH (desktop) */}
          <div className="hidden md:flex" style={{ flex: 1, maxWidth: '360px', margin: '0 auto' }}>
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-default)',
                borderRadius: '8px',
                padding: '7px 12px',
                cursor: 'text',
              }}
            >
              <Search size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Search markets…
              </span>
            </div>
          </div>

          {/* SPACER mobile */}
          <div className="flex-1 md:hidden" />

          {/* RIGHT SIDE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Portfolio + Cash (desktop, authenticated only) */}
            {authenticated && (
              <div className="hidden lg:flex" style={{ gap: '12px', marginRight: '4px' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  Portfolio <strong style={{ color: 'var(--color-text-primary)' }}>$0.00</strong>
                </span>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  Cash <strong style={{ color: 'var(--color-text-primary)' }}>$0.00</strong>
                </span>
              </div>
            )}

            {/* Deposit (desktop, authenticated only) */}
            {authenticated && (
              <button
                className="hidden md:block"
                style={{
                  background: 'var(--color-cta)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Deposit
              </button>
            )}

            {/* Theme toggle (desktop) */}
            <button
              className="hidden md:flex"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-tertiary)',
                padding: '6px',
                borderRadius: '6px',
                alignItems: 'center',
              }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Gift / Referral (desktop, authenticated) */}
            {authenticated && (
              <button
                className="hidden md:flex"
                aria-label="Referral"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-tertiary)',
                  padding: '6px',
                  borderRadius: '6px',
                  alignItems: 'center',
                }}
              >
                <Gift size={16} />
              </button>
            )}

            {/* Notifications */}
            <button
              aria-label="Notifications"
              style={{
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
              <Bell size={16} />
            </button>

            {/* REAL/DEMO switch (authenticated only) */}
            {authenticated && (
              <button
                onClick={() => setIsDemo(!isDemo)}
                style={{
                  background: isDemo ? 'var(--color-warning-bg)' : 'var(--color-cta-bg)',
                  color: isDemo ? 'var(--color-warning)' : 'var(--color-cta)',
                  border: `1px solid ${isDemo ? 'var(--color-warning)' : 'var(--color-cta)'}`,
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  letterSpacing: '0.04em',
                }}
              >
                <Zap size={11} />
                {isDemo ? 'DEMO' : 'REAL'}
              </button>
            )}

            {/* Profile / Login */}
            {!ready ? (
              <div
                style={{
                  width: '80px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--color-bg-tertiary)',
                }}
              />
            ) : authenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    color: 'var(--color-text-primary)',
                    fontSize: '13px',
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: 'var(--color-cta)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
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
                      maxWidth: '100px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {displayName}
                  </span>
                  <ChevronDown size={12} style={{ color: 'var(--color-text-muted)' }} />
                </button>

                {profileMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 6px)',
                      background: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: '10px',
                      minWidth: '180px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                      zIndex: 100,
                      overflow: 'hidden',
                    }}
                  >
                    <Link
                      href="/me"
                      onClick={() => setProfileMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 16px',
                        color: 'var(--color-text-secondary)',
                        textDecoration: 'none',
                        fontSize: '14px',
                      }}
                    >
                      <User size={14} />
                      My Profile
                    </Link>
                    <div style={{ height: '1px', background: 'var(--color-border-subtle)' }} />
                    <button
                      onClick={() => {
                        logout()
                        setProfileMenuOpen(false)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 16px',
                        color: 'var(--color-danger)',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={login}
                style={{
                  background: 'var(--color-cta)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '7px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden" style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }}
          />
          <nav
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '280px',
              background: 'var(--color-bg-secondary)',
              borderRight: '1px solid var(--color-border-default)',
              padding: '24px 16px',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                marginBottom: '24px',
                fontWeight: 700,
                fontSize: '18px',
                color: 'var(--color-text-primary)',
              }}
            >
              Auktora
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: pathname?.startsWith(link.href)
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-secondary)',
                  background: pathname?.startsWith(link.href)
                    ? 'var(--color-bg-tertiary)'
                    : 'transparent',
                  marginBottom: '4px',
                }}
              >
                {link.label}
              </Link>
            ))}
            <div
              style={{
                height: '1px',
                background: 'var(--color-border-subtle)',
                margin: '16px 0',
              }}
            />
            <button
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                fontSize: '15px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
          </nav>
        </div>
      )}
    </>
  )
}
