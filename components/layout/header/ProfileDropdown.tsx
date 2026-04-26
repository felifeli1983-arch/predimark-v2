'use client'

import Link from 'next/link'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { AuthUser } from '@/lib/hooks/useAuth'

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
          border: '1px solid var(--color-border-default)',
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
            onClick={() => setOpen(false)}
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
              onLogout()
              setOpen(false)
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
  )
}
