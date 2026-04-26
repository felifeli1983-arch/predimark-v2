'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { SidebarActivity } from './SidebarActivity'
import { SidebarHotNow } from './SidebarHotNow'

/**
 * Sezioni inline mobile (Doc 4 "Sidebar adattiva inline (mobile)"):
 * la sidebar desktop sparisce su <md, le 2-3 sezioni prioritarie compaiono
 * in flow verticale tra HeroZone e MarketsGrid.
 *
 * - Guest: Demo Mode CTA compatta + Hot Now + Recent Activity
 * - Logged: Hot Now + Recent Activity
 *
 * Visibile SOLO mobile (md:hidden). Riusa SidebarHotNow/SidebarActivity
 * senza duplicare logica.
 */
export function MobileSidebarRails() {
  const { authenticated, ready, login } = useAuth()

  return (
    <div
      className="md:hidden"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '12px 16px 4px',
      }}
    >
      {ready && !authenticated && (
        <section
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-cta)',
            borderRadius: 10,
            padding: '10px 12px',
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              flex: 1,
              minWidth: 0,
            }}
          >
            <strong style={{ color: 'var(--color-text-primary)' }}>Demo Mode</strong> — prova senza
            rischi.
          </span>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button
              type="button"
              onClick={login}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: 'var(--color-cta)',
                color: '#fff',
                border: 'none',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sign in
            </button>
            <Link
              href="/?demo=1"
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                background: 'transparent',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border-subtle)',
                fontSize: 11,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Try Demo
            </Link>
          </div>
        </section>
      )}

      <SidebarHotNow />
      <SidebarActivity />
    </div>
  )
}
