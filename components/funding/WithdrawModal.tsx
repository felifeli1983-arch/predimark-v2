'use client'

import { useState } from 'react'
import { X, ArrowUpFromLine, Loader2, ExternalLink } from 'lucide-react'
import { useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth'
import { createWalletClient, custom, type WalletClient, type Address } from 'viem'
import { polygon } from 'viem/chains'

import { unwrapPusdToUsdc } from '@/lib/polymarket/pusd-unwrap'

interface Props {
  open: boolean
  onClose: () => void
  /** Funder address (usato come default destination + sender). */
  funderAddress: string
  /** Saldo pUSD attuale (decimal, es. 100.50). */
  pusdBalance: number
  onSuccess?: () => void | Promise<void>
}

type Step = 'choose' | 'unwrap' | 'success'

/**
 * Modal Withdraw — flow 2-step:
 *  1. Unwrap pUSD → USDC.e on-chain (richiede gas MATIC, paga utente)
 *  2. Off-ramp: link diretto a MoonPay sell-to-bank o transfer a wallet esterno
 *
 * Per MVP MA4.6 lo step 2 è un link esterno (off-ramp via MoonPay sito).
 * In futuro (MA8 polish) si può integrare in-app via Privy off-ramp se Privy
 * lo aggiunge, oppure via direct MoonPay SDK.
 */
export function WithdrawModal({ open, onClose, funderAddress, pusdBalance, onSuccess }: Props) {
  const { wallets } = useWallets()
  const [amount, setAmount] = useState(String(Math.max(0, pusdBalance)))
  const [step, setStep] = useState<Step>('choose')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unwrapTx, setUnwrapTx] = useState<string | null>(null)

  if (!open) return null

  const numericAmount = Number(amount)
  const valid = Number.isFinite(numericAmount) && numericAmount > 0 && numericAmount <= pusdBalance

  async function handleUnwrap() {
    setError(null)
    setBusy(true)
    try {
      const embedded = getEmbeddedConnectedWallet(wallets)
      if (!embedded) throw new Error('Wallet embedded non trovato')
      const provider = await embedded.getEthereumProvider()
      const walletClient: WalletClient = createWalletClient({
        account: embedded.address as Address,
        chain: polygon,
        transport: custom(provider),
      })
      const res = await unwrapPusdToUsdc({
        signer: walletClient,
        funderAddress: funderAddress as Address,
        amountPusd: numericAmount,
      })
      setUnwrapTx(res.unwrapTxHash)
      setStep('success')
      await onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore unwrap')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <ArrowUpFromLine size={18} />
            <h2 style={{ margin: 0, fontSize: 'var(--font-lg)', fontWeight: 700 }}>Preleva pUSD</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: 'var(--space-1)',
              display: 'inline-flex',
            }}
          >
            <X size={18} />
          </button>
        </header>

        {step === 'choose' && (
          <>
            <div
              style={{
                fontSize: 'var(--font-sm)',
                color: 'var(--color-text-muted)',
                lineHeight: 1.5,
              }}
            >
              Step 1 di 2: convertiamo le tue pUSD in USDC.e on-chain. Costo gas Polygon: ~$0.02.
              Step 2 (off-ramp a banca) avviene nel passo successivo.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 'var(--font-xs)',
                  color: 'var(--color-text-muted)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                <span>Importo da prelevare</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  Max ${pusdBalance.toFixed(2)}
                </span>
              </div>
              <input
                type="number"
                min={1}
                step={1}
                max={pusdBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={busy}
                style={{
                  padding: 'var(--space-3)',
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-md)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              />
            </div>

            <div
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3)',
                display: 'grid',
                gap: 'var(--space-1)',
                fontSize: 'var(--font-sm)',
              }}
            >
              <Row label="Convertiamo" value={`${numericAmount.toFixed(2)} pUSD`} />
              <Row label="Riceverai" value={`${numericAmount.toFixed(2)} USDC.e`} bold />
              <Row label="Gas Polygon" value="~$0.02" />
            </div>

            {error && (
              <p
                style={{
                  margin: 0,
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'color-mix(in srgb, var(--color-danger) 12%, transparent)',
                  border: '1px solid var(--color-danger)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-sm)',
                  color: 'var(--color-danger)',
                }}
              >
                {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button type="button" onClick={onClose} disabled={busy} style={cancelBtn}>
                Annulla
              </button>
              <button
                type="button"
                onClick={handleUnwrap}
                disabled={busy || !valid}
                style={{ ...primaryBtn, opacity: busy || !valid ? 0.6 : 1 }}
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : 'Unwrap pUSD'}
              </button>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                padding: 'var(--space-3)',
                background: 'var(--color-success-bg)',
                border: '1px solid var(--color-success)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-success)',
                fontSize: 'var(--font-sm)',
              }}
            >
              ✓ Unwrap completato — {numericAmount.toFixed(2)} USDC.e ora nel tuo wallet
              {unwrapTx && (
                <a
                  href={`https://polygonscan.com/tx/${unwrapTx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 'var(--font-xs)',
                    color: 'var(--color-success)',
                    textDecoration: 'underline',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                  }}
                >
                  Vedi tx <ExternalLink size={11} />
                </a>
              )}
            </div>

            <div
              style={{
                fontSize: 'var(--font-sm)',
                color: 'var(--color-text-muted)',
                lineHeight: 1.5,
              }}
            >
              Step 2: per convertire USDC.e in EUR/USD sul tuo conto, usa MoonPay o trasferisci a un
              exchange (Binance, Coinbase) e preleva da lì.
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button type="button" onClick={onClose} style={cancelBtn}>
                Chiudi
              </button>
              <a
                href="https://www.moonpay.com/sell"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ...primaryBtn,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                }}
              >
                Vai a MoonPay <ExternalLink size={14} />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span
        style={{
          color: 'var(--color-text-primary)',
          fontWeight: bold ? 700 : 500,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  )
}

const primaryBtn: React.CSSProperties = {
  flex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-2)',
  padding: 'var(--space-3) var(--space-4)',
  background: 'var(--color-cta)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-md)',
  fontWeight: 700,
  cursor: 'pointer',
}

const cancelBtn: React.CSSProperties = {
  flex: 1,
  padding: 'var(--space-3) var(--space-4)',
  background: 'transparent',
  border: '1px solid var(--color-border-subtle)',
  color: 'var(--color-text-secondary)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--font-base)',
  fontWeight: 600,
  cursor: 'pointer',
}
