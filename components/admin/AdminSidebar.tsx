'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  DollarSign,
  Star,
  ShieldAlert,
  ScrollText,
  Settings,
} from 'lucide-react'

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Users',
    items: [{ href: '/admin/users', label: 'All users', icon: Users }],
  },
  {
    label: 'Markets',
    items: [{ href: '/admin/markets', label: 'All markets', icon: TrendingUp }],
  },
  {
    label: 'Fees',
    items: [{ href: '/admin/fees', label: 'Configuration', icon: DollarSign }],
  },
  {
    label: 'Creators',
    items: [
      { href: '/admin/creators', label: 'All creators', icon: Star },
      { href: '/admin/creators/applications', label: 'Applications', icon: Star },
    ],
  },
  {
    label: 'Compliance',
    items: [{ href: '/admin/compliance/geo-block', label: 'Geo-block', icon: ShieldAlert }],
  },
  {
    label: 'Audit',
    items: [{ href: '/admin/audit-log', label: 'Audit log', icon: ScrollText }],
  },
  {
    label: 'Settings',
    items: [{ href: '/admin/settings/team', label: 'Team', icon: Settings }],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        background: 'var(--color-bg-secondary)',
        borderRight: '1px solid var(--color-border-subtle)',
        padding: 'var(--space-3) var(--space-2)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      {NAV_GROUPS.map((group) => (
        <div key={group.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span
            style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '4px 8px',
              fontWeight: 600,
            }}
          >
            {group.label}
          </span>
          {group.items.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  fontSize: 'var(--font-sm)',
                  color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  background: active ? 'var(--color-bg-tertiary)' : 'transparent',
                  borderLeft: active ? '2px solid var(--color-cta)' : '2px solid transparent',
                  borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none',
                  fontWeight: active ? 600 : 500,
                }}
              >
                <Icon size={14} />
                {item.label}
              </Link>
            )
          })}
        </div>
      ))}
    </aside>
  )
}
