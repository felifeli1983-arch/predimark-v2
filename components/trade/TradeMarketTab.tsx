'use client'

import { Minus, Plus } from 'lucide-react'
import { useTradeWidget } from '@/lib/stores/useTradeWidget'

const QUICK_AMOUNTS = [1, 5, 10, 100]

/**
 * Modalità Mercato: importo USDC + quick amounts + payout calcolato live.
 */
export function TradeMarketTab() {
  const draft = useTradeWidget((s) => s.draft)
  const amountUsdc = useTradeWidget((s) => s.amountUsdc)
  const setAmount = useTradeWidget((s) => s.setAmountUsdc)
  const incrementAmount = useTradeWidget((s) => s.incrementAmount)

  if (!draft) return null

  const payout = draft.pricePerShare > 0 ? amountUsdc / draft.pricePerShare : 0
  const profit = payout - amountUsdc
  const priceCents = Math.round(draft.pricePerShare * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Importo grande con +/- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          aria-label="Diminuisci importo"
          onClick={() => incrementAmount(-1)}
          style={pillBtn}
        >
          <Minus size={16} />
        </button>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              fontSize: 'var(--font-xl)',
              color: 'var(--color-text-muted)',
              fontWeight: 600,
            }}
          >
            $
          </span>
          <input
            type="number"
            min={1}
            max={100000}
            step={1}
            value={amountUsdc}
            onChange={(e) => setAmount(Number(e.target.value))}
            style={{
              width: 120,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 'var(--font-3xl)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              fontVariantNumeric: 'tabular-nums',
              textAlign: 'center',
            }}
          />
        </div>
        <button
          type="button"
          aria-label="Aumenta importo"
          onClick={() => incrementAmount(1)}
          style={pillBtn}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Payout live */}
      <div
        style={{
          background: 'var(--color-bg-tertiary)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
            Per vincere
          </span>
          <strong
            style={{
              fontSize: 'var(--font-xl)',
              fontWeight: 700,
              color: 'var(--color-success)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            ${payout.toFixed(2)}
          </strong>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 'var(--font-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          <span>Profit potenziale</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-success)' }}>
            +${profit.toFixed(2)}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 'var(--font-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          <span>Prezzo medio</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{priceCents}¢</span>
        </div>
      </div>

      {/* Quick amounts */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {QUICK_AMOUNTS.map((q) => (
          <button key={q} type="button" onClick={() => incrementAmount(q)} style={chipBtn}>
            +${q}
          </button>
        ))}
      </div>
    </div>
  )
}

const pillBtn: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 'var(--radius-full)',
  background: 'var(--color-bg-tertiary)',
  border: '1px solid var(--color-border-subtle)',
  color: 'var(--color-text-primary)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}

const chipBtn: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 'var(--radius-full)',
  background: 'var(--color-bg-tertiary)',
  border: '1px solid var(--color-border-subtle)',
  color: 'var(--color-text-secondary)',
  fontSize: 'var(--font-sm)',
  fontWeight: 600,
  cursor: 'pointer',
  fontVariantNumeric: 'tabular-nums',
}
