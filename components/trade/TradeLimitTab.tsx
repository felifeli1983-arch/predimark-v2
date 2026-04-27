'use client'

import { Info } from 'lucide-react'
import { useTradeWidget } from '@/lib/stores/useTradeWidget'

/**
 * Modalità Limite — UI presente, submit disabilitato (rinviato MA4.4).
 */
export function TradeLimitTab() {
  const draft = useTradeWidget((s) => s.draft)
  const limitPriceCents = useTradeWidget((s) => s.limitPriceCents)
  const limitShares = useTradeWidget((s) => s.limitShares)
  const setLimitPrice = useTradeWidget((s) => s.setLimitPrice)
  const setLimitShares = useTradeWidget((s) => s.setLimitShares)

  if (!draft) return null

  const totalUsdc = (limitPriceCents / 100) * limitShares
  const payoutMax = limitShares * 1 // payout max per "yes" se vince

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          background: 'var(--color-warning-bg)',
          border: '1px solid var(--color-warning)',
          borderRadius: 8,
          padding: '8px 10px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          fontSize: 11,
          color: 'var(--color-warning)',
        }}
      >
        <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          Limit orders disponibili in MA4.4 (Polymarket CLOB). Per ora puoi solo configurare
          l&apos;ordine ma il submit è disabilitato.
        </span>
      </div>

      {/* Prezzo limit */}
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Prezzo limit (¢)</span>
        <input
          type="number"
          min={1}
          max={99}
          step={1}
          value={limitPriceCents}
          onChange={(e) => setLimitPrice(Number(e.target.value))}
          style={inputStyle}
        />
      </label>

      {/* Azioni */}
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Azioni</span>
        <input
          type="number"
          min={0}
          step={1}
          value={limitShares}
          onChange={(e) => setLimitShares(Number(e.target.value))}
          style={inputStyle}
        />
      </label>

      <div
        style={{
          background: 'var(--color-bg-tertiary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 8,
          padding: '10px 12px',
          fontSize: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Totale</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
            ${totalUsdc.toFixed(2)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--color-text-muted)' }}>Per vincere (max)</span>
          <span
            style={{
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 600,
              color: 'var(--color-success)',
            }}
          >
            ${payoutMax.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  background: 'var(--color-bg-tertiary)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 8,
  padding: '8px 12px',
  color: 'var(--color-text-primary)',
  fontSize: 14,
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
  outline: 'none',
}
