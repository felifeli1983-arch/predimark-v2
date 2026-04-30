import Link from 'next/link'
import {
  TrendingUp,
  History as HistoryIcon,
  Wallet,
  Bell,
  Settings,
  Gift,
  Star,
  Heart,
  BarChart2,
  Users,
} from 'lucide-react'
import { HeroFinanziario } from '@/components/me/HeroFinanziario'
import { PolymarketOnboardBanner } from '@/components/onboarding/PolymarketOnboardBanner'

const SECTIONS = [
  {
    href: '/me/positions',
    label: 'Posizioni aperte',
    icon: TrendingUp,
    description: 'Monitor P&L live',
  },
  {
    href: '/me/history',
    label: 'Storico trade',
    icon: HistoryIcon,
    description: 'Tutti i tuoi trade',
  },
  {
    href: '/me/stats',
    label: 'Statistiche',
    icon: BarChart2,
    description: 'Win rate, ROI, calibration',
  },
  {
    href: '/me/wallet',
    label: 'Wallet & Funding',
    icon: Wallet,
    description: 'Deposita & preleva',
  },
  { href: '/watchlist', label: 'Watchlist', icon: Star, description: 'I mercati che segui' },
  { href: '/me/following', label: 'Following', icon: Users, description: 'Trader copiati' },
  { href: '/me/notifications', label: 'Notifiche', icon: Bell, description: 'Alert push & email' },
  { href: '/me/referrals', label: 'Referrals', icon: Gift, description: 'Invita amici, guadagna' },
  {
    href: '/me/settings',
    label: 'Impostazioni',
    icon: Settings,
    description: 'Profilo, preferenze',
  },
  {
    href: '/creator/apply',
    label: 'Diventa Creator',
    icon: Heart,
    description: 'Programma Auktora',
  },
]

export default function MeDashboardPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 'var(--space-3)' }}>
      <HeroFinanziario />
      <PolymarketOnboardBanner />
      <header>
        <h1
          style={{
            margin: 0,
            fontSize: 'var(--font-2xl)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          Il tuo account
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
          }}
        >
          Tutto il tuo trading, posizioni, preferenze in un unico posto.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        {SECTIONS.map((s) => {
          const Icon = s.icon
          return (
            <Link
              key={s.href}
              href={s.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                padding: 'var(--space-3)',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                color: 'var(--color-text-primary)',
              }}
            >
              <Icon size={18} style={{ color: 'var(--color-cta)' }} />
              <strong style={{ fontSize: 'var(--font-md)' }}>{s.label}</strong>
              <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
                {s.description}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
