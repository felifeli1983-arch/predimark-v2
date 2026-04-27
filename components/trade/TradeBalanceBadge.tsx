'use client'

import { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Wallet } from 'lucide-react'
import { useThemeStore } from '@/lib/stores/themeStore'
import { fetchUserBalance, type UserBalance } from '@/lib/api/trades-client'
import { useTradeWidget } from '@/lib/stores/useTradeWidget'

/**
 * Badge saldo USDC dell'utente. Mostra demo o real in base a `themeStore.isDemo`.
 *
 * Hooka anche al `useTradeSubmit` succession via `lastResult` flow:
 * dopo un trade success il bottone widget chiama refetch (in MA4.3 il widget
 * stesso aggiorna il saldo passandolo al badge via prop o via re-fetch on
 * close — qui usiamo refetch on amountUsdc change come trigger MVP).
 */
export function TradeBalanceBadge() {
  const { authenticated, ready, getAccessToken } = usePrivy()
  const isDemo = useThemeStore((s) => s.isDemo)
  // Re-fetch balance ogni volta che il widget si chiude (proxy per "trade eseguito")
  const widgetOpen = useTradeWidget((s) => s.isOpen)
  const [balance, setBalance] = useState<UserBalance | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!ready || !authenticated) return
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const token = await getAccessToken()
        if (!token) return
        const b = await fetchUserBalance(token)
        if (!cancelled) setBalance(b)
      } catch {
        /* silent */
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
    // re-fetch al cambio di widgetOpen (incluso close → trade probabile)
  }, [ready, authenticated, getAccessToken, widgetOpen])

  if (!authenticated || !balance) return null

  const value = isDemo ? balance.demoBalance : balance.usdcBalance
  const label = isDemo ? 'DEMO' : 'USDC'

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        borderRadius: 8,
        background: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border-subtle)',
        fontSize: 12,
        color: 'var(--color-text-secondary)',
        opacity: loading ? 0.6 : 1,
      }}
    >
      <Wallet size={12} style={{ color: isDemo ? 'var(--color-warning)' : 'var(--color-cta)' }} />
      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
        ${value.toFixed(2)}
      </span>
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}>{label}</span>
    </div>
  )
}
