'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Search,
  Zap,
  ShoppingCart,
  MoreHorizontal,
  User,
  Bookmark,
  Users,
  Activity,
  Trophy,
  Settings,
  BarChart2,
  Star,
  Info,
  CreditCard,
  HelpCircle,
  FileText,
  LogIn,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'

/* ──────────────────────────────────────────
   "Altro" bottom sheet — contenuto da Doc 4
   ────────────────────────────────────────── */
const MORE_ITEMS_AUTHENTICATED = [
  { href: '/me', icon: User, label: 'Profile' },
  { href: '/me/watchlist', icon: Bookmark, label: 'Watchlist' },
  { href: '/following', icon: Users, label: 'Following' },
  { href: '/me/positions', icon: Activity, label: 'Sessions' },
  { href: '/me/stats', icon: Trophy, label: 'Achievements' },
  { href: '/me/settings', icon: Settings, label: 'Settings' },
  { href: '/leaderboard', icon: BarChart2, label: 'Classifica' },
  { href: '/creator', icon: Star, label: 'Creator program' },
  { href: '/about', icon: Info, label: 'About' },
  { href: '/pricing', icon: CreditCard, label: 'Pricing' },
  { href: '/help', icon: HelpCircle, label: 'Help' },
  { href: '/legal', icon: FileText, label: 'Legal' },
]

const MORE_ITEMS_GUEST = [
  { href: '/leaderboard', icon: BarChart2, label: 'Classifica' },
  { href: '/creator', icon: Star, label: 'Creator program' },
  { href: '/about', icon: Info, label: 'About' },
  { href: '/pricing', icon: CreditCard, label: 'Pricing' },
  { href: '/help', icon: HelpCircle, label: 'Help' },
  { href: '/legal', icon: FileText, label: 'Legal' },
]

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/search', icon: Search, label: 'Search' },
  { href: '/signals', icon: Zap, label: 'Signals' },
  { href: '/slip', icon: ShoppingCart, label: 'Slip' },
]

export function BottomNav() {
  const pathname = usePathname()
  const { authenticated, login } = useAuth()
  const [moreOpen, setMoreOpen] = useState(false)

  const moreItems = authenticated ? MORE_ITEMS_AUTHENTICATED : MORE_ITEMS_GUEST

  return (
    <>
      {/*
       * PWA: BottomNav è IN FLOW nel flex column dell'app shell (layout.tsx).
       * NON usa position:fixed — il flex column lo spinge automaticamente in fondo.
       * md:hidden lo nasconde su desktop (≥768px).
       */}
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
        {/* Le 4 voci principali */}
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
                padding: '10px 4px 8px',
                gap: '3px',
                textDecoration: 'none',
                color: isActive ? 'var(--color-cta)' : 'var(--color-text-muted)',
                transition: 'color 150ms',
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 400 }}>{label}</span>
            </Link>
          )
        })}

        {/* "Altro" — apre bottom sheet */}
        <button
          onClick={() => setMoreOpen(true)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 4px 8px',
            gap: '3px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: moreOpen ? 'var(--color-cta)' : 'var(--color-text-muted)',
            transition: 'color 150ms',
          }}
        >
          <MoreHorizontal size={20} strokeWidth={moreOpen ? 2.5 : 1.8} />
          <span style={{ fontSize: '10px', fontWeight: moreOpen ? 600 : 400 }}>More</span>
        </button>
      </nav>

      {/* ══════════════════════════════════════
          "ALTRO" BOTTOM SHEET
          (Doc 4: Profile, Watchlist, Following, Sessions,
           Achievements, Settings, Classifica, Creator program,
           About, Pricing, Help, Legal, accedi/registrati)
      ══════════════════════════════════════ */}
      {moreOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setMoreOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }}
          />

          {/* Sheet */}
          <div
            style={{
              position: 'relative',
              background: 'var(--color-bg-secondary)',
              borderRadius: '16px 16px 0 0',
              maxHeight: '80dvh',
              overflowY: 'auto',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* Handle + header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px 12px',
                position: 'sticky',
                top: 0,
                background: 'var(--color-bg-secondary)',
                borderBottom: '1px solid var(--color-border-subtle)',
                zIndex: 1,
              }}
            >
              <span
                style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-primary)' }}
              >
                Menu
              </span>
              <button
                onClick={() => setMoreOpen(false)}
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

            {/* Items grid — 2 colonne */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2px',
                padding: '8px 12px',
              }}
            >
              {moreItems.map(({ href, icon: Icon, label }) => {
                const isActive = pathname === href || pathname?.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '13px 14px',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      color: isActive ? 'var(--color-cta)' : 'var(--color-text-secondary)',
                      background: isActive ? 'var(--color-cta-bg)' : 'transparent',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    {label}
                  </Link>
                )
              })}
            </div>

            {/* Accedi / Registrati — solo se non autenticato */}
            {!authenticated && (
              <div style={{ padding: '8px 12px 16px' }}>
                <div
                  style={{
                    height: '1px',
                    background: 'var(--color-border-subtle)',
                    marginBottom: '12px',
                  }}
                />
                <button
                  onClick={() => {
                    login()
                    setMoreOpen(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '13px',
                    borderRadius: '10px',
                    background: 'var(--color-cta)',
                    color: '#fff',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <LogIn size={16} />
                  Accedi / Registrati
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
