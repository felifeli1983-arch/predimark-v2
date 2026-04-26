'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  Search,
  Bell,
  Gift,
  ChevronDown,
  LogOut,
  User,
  Sun,
  Moon,
  Zap,
  X,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
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
  const profileRef = useRef<HTMLDivElement>(null)

  const displayName =
    user?.email ?? (user?.walletAddress ? `${user.walletAddress.slice(0, 6)}…` : 'Profile')

  // Chiudi dropdown profilo cliccando fuori
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Blocca scroll body quando drawer mobile è aperto
  useEffect(() => {
    // Il body ha overflow:hidden per il PWA shell — il drawer usa il suo scroll interno
    // Non serve gestire il body qui, ma chiudiamo su Escape
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <header
        style={{
          flexShrink: 0,
          background: 'var(--color-bg-primary)',
          borderBottom: '1px solid var(--color-border-default)',
          zIndex: 50,
          position: 'relative', // necessario per z-index
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 16px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* ── HAMBURGER (mobile only) ── */}
          <button
            className="flex md:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Apri menu"
            style={{
              flexShrink: 0,
              color: 'var(--color-text-secondary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              alignItems: 'center',
            }}
          >
            <Menu size={20} />
          </button>

          {/* ── LOGO ── */}
          <Link
            href="/"
            style={{
              flexShrink: 0,
              fontWeight: 700,
              fontSize: '17px',
              color: 'var(--color-text-primary)',
              textDecoration: 'none',
              letterSpacing: '-0.02em',
            }}
          >
            Auktora
          </Link>

          {/* ── NAV DESKTOP ── */}
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

          {/* ── SEARCH (desktop, cresce fino a max) ── */}
          <div
            className="hidden md:flex"
            style={{ flex: 1, minWidth: 0, maxWidth: '320px', marginLeft: 'auto' }}
          >
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-default)',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'text',
              }}
            >
              <Search size={13} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Search markets…
              </span>
            </div>
          </div>

          {/* ── SPACER mobile ── */}
          <div style={{ flex: 1 }} className="md:hidden" />

          {/* ── RIGHT SIDE ── */}
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginLeft: '8px',
            }}
          >
            {/* Portfolio + Cash — lg+ solo se autenticato */}
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
                    style={{
                      color: 'var(--color-text-primary)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
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
                    style={{
                      color: 'var(--color-text-primary)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    $0.00
                  </strong>
                </span>
              </div>
            )}

            {/* Deposit — md+ solo se autenticato */}
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

            {/* Theme toggle — md+ */}
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

            {/* Gift — md+ solo se autenticato */}
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

            {/* Notifications */}
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

            {/* REAL/DEMO switch — larghezza FISSA per evitare layout shift */}
            {authenticated && (
              <button
                onClick={() => setIsDemo(!isDemo)}
                aria-label={isDemo ? 'Passa a REAL' : 'Passa a DEMO'}
                style={{
                  flexShrink: 0,
                  /* width fisso: REAL e DEMO occupano sempre lo stesso spazio */
                  width: '70px',
                  justifyContent: 'center',
                  background: isDemo ? 'var(--color-warning-bg)' : 'var(--color-cta-bg)',
                  color: isDemo ? 'var(--color-warning)' : 'var(--color-cta)',
                  border: `1px solid ${isDemo ? 'var(--color-warning)' : 'var(--color-cta)'}`,
                  borderRadius: '6px',
                  padding: '5px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  letterSpacing: '0.05em',
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
                  flexShrink: 0,
                  width: '72px',
                  height: '30px',
                  borderRadius: '7px',
                  background: 'var(--color-bg-tertiary)',
                }}
              />
            ) : authenticated ? (
              <div ref={profileRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    background: 'var(--color-bg-secondary)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: '7px',
                    padding: '5px 8px',
                    cursor: 'pointer',
                    color: 'var(--color-text-primary)',
                    fontSize: '12px',
                  }}
                >
                  {/* Avatar iniziale */}
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
                  <ChevronDown
                    size={11}
                    style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}
                  />
                </button>

                {/* Dropdown profilo */}
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
                      boxShadow: 'var(--shadow-lg)',
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
                        padding: '11px 16px',
                        color: 'var(--color-text-secondary)',
                        textDecoration: 'none',
                        fontSize: '13px',
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
                        padding: '11px 16px',
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
        </div>
      </header>

      {/* ══════════════════════════════════════
          MOBILE DRAWER (hamburger)
          Layer sopra il contenuto — non interferisce con app shell
      ══════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }}
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
              borderRight: '1px solid var(--color-border-default)',
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
              <span
                style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-text-primary)' }}
              >
                Auktora
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
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
                    onClick={() => setMobileMenuOpen(false)}
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
                onClick={() => {
                  toggleTheme()
                }}
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
      )}
    </>
  )
}
