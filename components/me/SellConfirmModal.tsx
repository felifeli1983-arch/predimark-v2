'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth'
import { createWalletClient, custom, type WalletClient } from 'viem'
import { polygon } from 'viem/chains'

import { useThemeStore } from '@/lib/stores/themeStore'
import { computeSellPnL } from '@/lib/trades/pnl'
import { useSellTrade } from '@/lib/hooks/useSellTrade'
import { buildAndSignSellOrder } from '@/lib/polymarket/order-create'
import type { PositionItem } from '@/lib/api/positions-client'

interface Props {
  position: PositionItem | null
  onClose: () => void
  onSold: (positionId: string, sharesSold: number) => void
}

export function SellConfirmModal({ position, onClose, onSold }: Props) {
  const isDemo = useThemeStore((s) => s.isDemo)
  const { wallets } = useWallets()
  const { status, error, submit, reset } = useSellTrade()
  const [percent, setPercent] = useState(100)
  const [signing, setSigning] = useState(false)

  useEffect(() => {
    if (position) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPercent(100)
      reset()
    }
  }, [position, reset])

  if (!position) return null

  const currentPrice = position.currentPrice ?? position.avgPrice
  const sharesToSell = +(position.shares * (percent / 100)).toFixed(4)
  const preview = computeSellPnL(position.avgPrice, currentPrice, sharesToSell)
  const submitting = status === 'submitting'
  const success = status === 'success'

  async function handleConfirm() {
    if (!position) return
    if (sharesToSell <= 0) return

    if (isDemo) {
      const res = await submit({
        positionId: position.id,
        sharesToSell,
        currentPrice,
        isDemo: true,
      })
      if (res) onSold(position.id, sharesToSell)
      return
    }

    // REAL: serve build + sign sell order client-side via Privy
    if (!position.tokenId) {
      // SellTrade reset+error tramite hook se non disponibile
      console.error('[sell-real] tokenId mancante per posizione', position.id)
      return
    }
    const embedded = getEmbeddedConnectedWallet(wallets)
    if (!embedded) {
      console.error('[sell-real] wallet embedded Privy non trovato')
      return
    }

    setSigning(true)
    try {
      const provider = await embedded.getEthereumProvider()
      const walletClient: WalletClient = createWalletClient({
        account: embedded.address as `0x${string}`,
        chain: polygon,
        transport: custom(provider),
      })
      const signedOrder = await buildAndSignSellOrder({
        signer: walletClient,
        funderAddress: embedded.address,
        tokenId: position.tokenId,
        pricePerShare: currentPrice,
        sharesToSell,
      })
      setSigning(false)
      const res = await submit({
        positionId: position.id,
        sharesToSell,
        currentPrice,
        isDemo: false,
        tokenId: position.tokenId,
        signedOrder: signedOrder as unknown as Record<string, unknown>,
      })
      if (res) onSold(position.id, sharesToSell)
    } catch (err) {
      setSigning(false)
      console.error('[sell-real] signing or submit failed', err)
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
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2
            style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}
          >
            Vendi posizione
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              display: 'inline-flex',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </header>

        <div
          style={{
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {position.title}
          <span style={{ color: 'var(--color-text-muted)' }}> — {position.side.toUpperCase()}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 11,
              color: 'var(--color-text-muted)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <span>Quantità da vendere</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{percent}%</span>
          </div>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={percent}
            onChange={(e) => setPercent(Number(e.target.value))}
            disabled={submitting || success}
            style={{ width: '100%', accentColor: 'var(--color-cta)' }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[25, 50, 75, 100].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPercent(p)}
                disabled={submitting || success}
                style={{
                  flex: 1,
                  minWidth: 60,
                  padding: '6px 10px',
                  background: percent === p ? 'var(--color-cta)' : 'var(--color-bg-secondary)',
                  color: percent === p ? '#fff' : 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: submitting || success ? 'not-allowed' : 'pointer',
                }}
              >
                {p}%
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 8,
            padding: 12,
            display: 'grid',
            gap: 6,
            fontSize: 12,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <Row label="Shares" value={sharesToSell.toFixed(4)} />
          <Row label="Prezzo corrente" value={`$${currentPrice.toFixed(3)}`} />
          <Row label="Totale ricevuto" value={`$${preview.totalReceived.toFixed(2)}`} bold />
          <Row
            label="P&L stimato"
            value={`${preview.pnl >= 0 ? '+' : ''}$${preview.pnl.toFixed(2)} (${preview.pnl >= 0 ? '+' : ''}${preview.pnlPct.toFixed(1)}%)`}
            color={preview.pnl >= 0 ? 'var(--color-success)' : 'var(--color-danger)'}
            bold
          />
        </div>

        {error && <p style={{ margin: 0, color: 'var(--color-danger)', fontSize: 12 }}>{error}</p>}
        {success && (
          <p style={{ margin: 0, color: 'var(--color-success)', fontSize: 12 }}>
            Vendita completata.
          </p>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '10px 14px',
              background: 'transparent',
              border: '1px solid var(--color-border-subtle)',
              color: 'var(--color-text-secondary)',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {success ? 'Chiudi' : 'Annulla'}
          </button>
          {!success && (
            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting || signing || sharesToSell <= 0}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'var(--color-cta)',
                border: 'none',
                color: '#fff',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: submitting || signing ? 'not-allowed' : 'pointer',
                opacity: submitting || signing ? 0.7 : 1,
              }}
            >
              {signing
                ? 'In firma…'
                : submitting
                  ? 'Vendita…'
                  : isDemo
                    ? 'Conferma'
                    : 'Firma e vendi'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  color,
  bold,
}: {
  label: string
  value: string
  color?: string
  bold?: boolean
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      <span
        style={{
          color: color ?? 'var(--color-text-primary)',
          fontWeight: bold ? 700 : 500,
        }}
      >
        {value}
      </span>
    </div>
  )
}
