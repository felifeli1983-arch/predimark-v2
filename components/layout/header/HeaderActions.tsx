'use client'

import { Gift, Sun, Moon, Wallet, TrendingUp, Star, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { useFundWallet, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth'
import { polygon } from 'viem/chains'
import type { AuthUser } from '@/lib/hooks/useAuth'
import { useThemeStore } from '@/lib/stores/themeStore'
import { useBalance } from '@/lib/stores/useBalance'
import { useRedeemPromptStore } from '@/lib/stores/useRedeemPrompt'
import { ProfileDropdown } from './ProfileDropdown'
import { RealDemoToggle } from './RealDemoToggle'
import { NotificationBell } from './NotificationBell'
import { useBetSlip } from '@/lib/stores/useBetSlip'

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
  // Redeem prompt — Gift icon mostra badge quando ci sono vincite non claimate.
  const unclaimedCount = useRedeemPromptStore((s) => s.unclaimedCount)
  const unclaimedTotal = useRedeemPromptStore((s) => s.unclaimedTotal)
  const setRedeemOpen = useRedeemPromptStore((s) => s.setOpen)

  // Privy fund wallet (Apple Pay / Google Pay / Card / MoonPay)
  const { fundWallet } = useFundWallet()
  const { wallets } = useWallets()
  const [depositError, setDepositError] = useState<string | null>(null)

  async function handleDeposit() {
    setDepositError(null)
    if (!authenticated) {
      login()
      return
    }
    // Privy useFundWallet supporta sia embedded sia external wallet
    const embedded = getEmbeddedConnectedWallet(wallets) ?? wallets[0]
    if (!embedded) {
      setDepositError('Nessun wallet rilevato — riprova dopo il login')
      console.error('[deposit] no wallet found', { walletsCount: wallets.length })
      return
    }
    console.warn('[deposit] starting fundWallet', { address: embedded.address })
    try {
      await fundWallet({
        address: embedded.address,
        options: {
          chain: polygon,
          amount: '100',
          asset: 'USDC',
        },
      })
      console.warn('[deposit] fundWallet completed')
      // BalanceHydrator si auto-refreshrà al prossimo poll
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore deposito'
      console.error('[deposit] fundWallet error', err)
      setDepositError(msg)
      // Fallback: se Privy fundWallet non è configurato nel dashboard,
      // la chiamata può fallire con messaggio specifico
      if (
        msg.toLowerCase().includes('not enabled') ||
        msg.toLowerCase().includes('not configured')
      ) {
        setDepositError('Funding non configurato nel dashboard Privy. Contatta admin.')
      }
    }
  }

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
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={handleDeposit}
            className="hidden md:flex"
            style={{
              flexShrink: 0,
              background: 'var(--color-cta)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-2) var(--space-3)',
              fontSize: 'var(--font-sm)',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              alignItems: 'center',
            }}
          >
            Deposit
          </button>
          {depositError && (
            <div
              role="alert"
              onClick={() => setDepositError(null)}
              style={{
                position: 'absolute',
                top: 'calc(100% + var(--space-2))',
                right: 0,
                minWidth: 280,
                maxWidth: 360,
                padding: 'var(--space-3)',
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-danger)',
                fontSize: 'var(--font-sm)',
                lineHeight: 1.4,
                cursor: 'pointer',
                zIndex: 100,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <strong style={{ display: 'block', marginBottom: 4 }}>
                Deposito non disponibile
              </strong>
              {depositError}
              <div style={{ marginTop: 6, fontSize: 'var(--font-xs)', opacity: 0.7 }}>
                (Click per chiudere)
              </div>
            </div>
          )}
        </div>
      )}

      <button
        className="hidden md:flex"
        onClick={toggleTheme}
        aria-label="Toggle tema"
        style={iconBtnStyle}
      >
        {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {authenticated && (
        <button
          type="button"
          onClick={() => setRedeemOpen(true)}
          className="hidden md:flex"
          aria-label={
            unclaimedCount > 0
              ? `${unclaimedCount} vincite da incassare ($${unclaimedTotal.toFixed(2)})`
              : 'Vincite'
          }
          title={
            unclaimedCount > 0
              ? `Hai $${unclaimedTotal.toFixed(2)} da incassare`
              : 'Nessuna vincita da incassare'
          }
          style={{ ...iconBtnStyle, position: 'relative' }}
        >
          <Gift
            size={15}
            style={{ color: unclaimedCount > 0 ? 'var(--color-success)' : undefined }}
          />
          {unclaimedCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                minWidth: 14,
                height: 14,
                padding: '0 4px',
                borderRadius: 7,
                background: 'var(--color-success)',
                color: '#fff',
                fontSize: 9,
                fontWeight: 700,
                lineHeight: '14px',
                textAlign: 'center',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {unclaimedCount > 9 ? '9+' : unclaimedCount}
            </span>
          )}
        </button>
      )}

      {authenticated && (
        <Link
          href="/watchlist"
          aria-label="Watchlist"
          className="hidden md:flex"
          style={{ ...iconBtnStyle, textDecoration: 'none' }}
        >
          <Star size={15} />
        </Link>
      )}

      <BetSlipButton iconBtnStyle={iconBtnStyle} />

      <NotificationBell iconBtnStyle={iconBtnStyle} />

      {authenticated && <RealDemoToggle isDemo={isDemo} onToggle={toggleDemo} />}

      {!ready ? (
        <div
          style={{
            flexShrink: 0,
            width: '72px',
            height: '30px',
            borderRadius: 'var(--radius-md)',
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
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-4)',
            fontSize: 'var(--font-base)',
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

/** Stile condiviso per icon-button compatti (theme/gift/star/bell). */
const iconBtnStyle: React.CSSProperties = {
  flexShrink: 0,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--color-text-tertiary)',
  padding: 'var(--space-1)',
  borderRadius: 'var(--radius-sm)',
  alignItems: 'center',
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
        gap: 'var(--space-2)',
        padding: 'var(--space-1) var(--space-3)',
        borderRadius: 'var(--radius-md)',
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
            fontSize: 'var(--font-xs)',
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
            fontSize: 'var(--font-sm)',
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

function BetSlipButton({ iconBtnStyle }: { iconBtnStyle: React.CSSProperties }) {
  const count = useBetSlip((s) => s.legs.length)
  const setOpen = useBetSlip((s) => s.setOpen)
  if (count === 0) return null
  return (
    <button
      type="button"
      aria-label={`Apri Bet Slip (${count} previsioni)`}
      onClick={() => setOpen(true)}
      style={{ ...iconBtnStyle, display: 'flex', position: 'relative' }}
    >
      <ShoppingBag size={15} />
      <span
        style={{
          position: 'absolute',
          top: 2,
          right: 2,
          minWidth: 14,
          height: 14,
          padding: '0 3px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-cta)',
          color: '#fff',
          fontSize: 9,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        }}
      >
        {count}
      </span>
    </button>
  )
}
