'use client'

import { useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, Loader2 } from 'lucide-react'
import { useFundWallet, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth'
import { polygon } from 'viem/chains'

import { WithdrawModal } from './WithdrawModal'

interface Props {
  /**
   * Address EVM destinatario. Se omesso, viene auto-rilevato dall'embedded
   * wallet Privy. Esplicitalo solo quando vuoi forzare un funder specifico.
   */
  address?: string
  /** Saldo pUSD attuale per modal withdraw (default 0 → bottone disabled). */
  pusdBalance?: number
  /** Importo default suggerito in USD (per modal Privy). */
  defaultAmount?: string
  /** Compact mode (smaller buttons inline vs full-width grid). */
  compact?: boolean
  /** Callback opzionale post deposit/withdraw success per refresh balance. */
  onSuccess?: () => void
}

/**
 * Riga azioni Funding — Deposit + Preleva. Sfrutta Privy useFundWallet che
 * gestisce nativamente AstroPay / Card / Apple Pay / Google Pay / MoonPay /
 * external wallet transfer. Niente nostra modal custom — la UX Privy è già
 * curata e gestisce KYC/compliance lato provider.
 *
 * Per il withdraw: Privy non ha equivalent fundWallet "reverse" — apriamo
 * deeplink a polymarket.com/withdraw oppure forniamo manual transfer
 * (TODO MA4.6-B con Onramp.unwrap() + send to bank).
 */
export function FundActionsRow({
  address,
  pusdBalance = 0,
  defaultAmount = '100',
  compact = false,
  onSuccess,
}: Props) {
  const { fundWallet } = useFundWallet({
    onUserExited: () => {
      onSuccess?.()
    },
  })
  const { wallets } = useWallets()
  const [busy, setBusy] = useState<'deposit' | null>(null)
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  const embedded = getEmbeddedConnectedWallet(wallets) ?? wallets[0]
  const effectiveAddress = address || embedded?.address || ''

  async function handleDeposit() {
    if (!effectiveAddress) return
    setBusy('deposit')
    try {
      await fundWallet({
        address: effectiveAddress,
        options: {
          chain: polygon,
          amount: defaultAmount,
          asset: 'USDC',
        },
      })
      onSuccess?.()
    } catch (err) {
      console.error('[deposit]', err)
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: compact ? 'auto auto' : '1fr 1fr',
          gap: 'var(--space-2)',
        }}
      >
        <button
          type="button"
          onClick={handleDeposit}
          disabled={busy === 'deposit'}
          style={depositBtn}
        >
          {busy === 'deposit' ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <ArrowDownToLine size={14} />
          )}
          Deposita
        </button>
        <button
          type="button"
          onClick={() => setWithdrawOpen(true)}
          disabled={pusdBalance <= 0}
          style={{ ...withdrawBtn, opacity: pusdBalance <= 0 ? 0.5 : 1 }}
        >
          <ArrowUpFromLine size={14} />
          Preleva
        </button>
      </div>
      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        funderAddress={effectiveAddress}
        pusdBalance={pusdBalance}
        onSuccess={onSuccess}
      />
    </>
  )
}

const depositBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-2)',
  padding: 'var(--space-3) var(--space-4)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-cta)',
  color: '#fff',
  border: 'none',
  fontSize: 'var(--font-md)',
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}

const withdrawBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-2)',
  padding: 'var(--space-3) var(--space-4)',
  borderRadius: 'var(--radius-md)',
  background: 'var(--color-bg-tertiary)',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--color-border-subtle)',
  fontSize: 'var(--font-md)',
  fontWeight: 600,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}
