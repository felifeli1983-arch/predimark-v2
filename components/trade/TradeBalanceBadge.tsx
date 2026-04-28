'use client'

import { Wallet } from 'lucide-react'
import { useThemeStore } from '@/lib/stores/themeStore'
import { useBalance } from '@/lib/stores/useBalance'

/**
 * Badge saldo USDC dell'utente. Mostra demo o real in base a `themeStore.isDemo`.
 * Legge dallo store globale `useBalance` (sync via BalanceHydrator).
 */
export function TradeBalanceBadge() {
  const isDemo = useThemeStore((s) => s.isDemo)
  const usdcBalance = useBalance((s) => s.usdcBalance)
  const demoBalance = useBalance((s) => s.demoBalance)
  const hydrated = useBalance((s) => s.hydrated)

  // Non mostriamo finché lo store non è stato popolato dal Hydrator
  // (evita flash con valori default)
  if (!hydrated) return null

  const value = isDemo ? demoBalance : usdcBalance
  const label = isDemo ? 'DEMO' : 'USDC'

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border-subtle)',
        fontSize: 'var(--font-sm)',
        color: 'var(--color-text-secondary)',
      }}
    >
      <Wallet size={12} style={{ color: isDemo ? 'var(--color-warning)' : 'var(--color-cta)' }} />
      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
        ${value.toFixed(2)}
      </span>
      <span style={{ fontSize: 'var(--font-xs)', fontWeight: 700, letterSpacing: '0.05em' }}>
        {label}
      </span>
    </div>
  )
}
