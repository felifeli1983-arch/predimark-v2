'use client'

import { Minus, Plus, AlertTriangle, Loader2 } from 'lucide-react'
import { useTradeWidget } from '@/lib/stores/useTradeWidget'
import { useMarketImpact } from '@/lib/hooks/useMarketImpact'

const QUICK_AMOUNTS = [1, 5, 10, 100]
/** Soglia oltre la quale la slippage viene mostrata in giallo. */
const SLIPPAGE_WARNING_PCT = 1.0
/** Soglia oltre la quale la slippage diventa critica (rossa). */
const SLIPPAGE_DANGER_PCT = 3.0

/**
 * Modalità Mercato: importo USDC + quick amounts + payout calcolato live.
 *
 * Doc Prices & Orderbook: il "displayed price" è il midpoint del bid-ask
 * spread, ma il prezzo a cui un BUY market order esegue è l'ASK del top
 * book. `useMarketImpact` chiama `calculateMarketPrice` SDK e restituisce
 * il prezzo di fill REALE per quell'amount specifico — utile per ordini
 * grandi che attraversano più livelli di book (slippage).
 */
export function TradeMarketTab() {
  const draft = useTradeWidget((s) => s.draft)
  const amountUsdc = useTradeWidget((s) => s.amountUsdc)
  const setAmount = useTradeWidget((s) => s.setAmountUsdc)
  const incrementAmount = useTradeWidget((s) => s.incrementAmount)

  const sideUpper = (draft?.side ?? '').toLowerCase()
  const isBuy = sideUpper === 'yes' || sideUpper === 'up' || sideUpper === 'buy'

  // Live fill-price stimato (vero prezzo di esecuzione, non midpoint snapshot)
  const { fillPrice, slippagePct, loading } = useMarketImpact(
    draft?.tokenId ?? null,
    isBuy ? 'BUY' : 'SELL',
    amountUsdc,
    draft?.pricePerShare ?? 0
  )

  if (!draft) return null

  // Effective price: usa fillPrice se disponibile, altrimenti midpoint snapshot
  const effectivePrice = fillPrice ?? draft.pricePerShare
  const payout = effectivePrice > 0 ? amountUsdc / effectivePrice : 0
  const profit = payout - amountUsdc
  const priceCents = Math.round(effectivePrice * 100)
  const midpointCents = Math.round(draft.pricePerShare * 100)
  const slippageAbs = Math.abs(slippagePct ?? 0)
  const slippageColor =
    slippageAbs >= SLIPPAGE_DANGER_PCT
      ? 'var(--color-danger)'
      : slippageAbs >= SLIPPAGE_WARNING_PCT
        ? 'var(--color-warning)'
        : 'var(--color-text-muted)'

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
            alignItems: 'center',
            fontSize: 'var(--font-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Prezzo di fill stimato
            {loading && (
              <Loader2
                size={10}
                className="animate-spin"
                style={{ color: 'var(--color-text-muted)' }}
              />
            )}
          </span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {priceCents}¢
            {fillPrice !== null && fillPrice !== draft.pricePerShare && (
              <span style={{ color: 'var(--color-text-muted)', marginLeft: 4 }}>
                (mid {midpointCents}¢)
              </span>
            )}
          </span>
        </div>
        {slippagePct !== null && slippageAbs >= 0.1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 'var(--font-xs)',
              color: slippageColor,
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {slippageAbs >= SLIPPAGE_WARNING_PCT && <AlertTriangle size={10} />}
              Slippage vs mid
            </span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {slippagePct >= 0 ? '+' : ''}
              {slippagePct.toFixed(2)}%
            </span>
          </div>
        )}
        {slippageAbs >= SLIPPAGE_DANGER_PCT && (
          <div
            style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--color-danger)',
              lineHeight: 1.4,
              marginTop: 2,
            }}
          >
            ⚠ Ordine grande rispetto al book. Considera di splittarlo o di usare un limit order.
          </div>
        )}
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
