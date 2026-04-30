'use client'

import { Activity, Coins, Loader2 } from 'lucide-react'
import type { CardKind } from '@/lib/polymarket/mappers'
import { useCryptoLivePrice } from '@/lib/ws/hooks/useCryptoLivePrice'
import { CenteredBox, Container, SectionTitle } from './chart/ChartShell'
import { HistoryChart } from './HistoryChart'
import { MultiLineChart, type MultiMarket } from './MultiLineChart'
import { CryptoCandleChart } from './CryptoCandleChart'

interface Props {
  marketId: string
  cardKind?: CardKind
  /** Simbolo crypto es. 'btcusdt' — estratto da EventPageShell per crypto_up_down */
  cryptoSymbol?: string
  /** Evento attualmente live — usato per h2h_sport (mostra score stub) */
  isLive?: boolean
  /**
   * Solo per cardKind === 'multi_outcome': array di top-5 outcome.
   * Se presente con multi_outcome → usa MultiLineChart.
   */
  multiMarkets?: MultiMarket[]
}

/**
 * Sprint 3.5.4 / 3.5.5 — Router CardKind-aware per il chart event-page.
 *
 *  - binary | h2h_sport (non-live) → HistoryChart con dual-line YES/NO
 *  - multi_outcome (con multiMarkets) → MultiLineChart (fino a 5 curve)
 *  - multi_strike → HistoryChart single-line YES
 *  - crypto_up_down → LiveSpotView (Chainlink spot price)
 *  - h2h_sport (live) → LiveScoreStub
 */
export function PriceHistoryChart({
  marketId,
  cardKind = 'binary',
  cryptoSymbol,
  isLive,
  multiMarkets,
}: Props) {
  if (cardKind === 'crypto_up_down') {
    return <LiveSpotView cryptoSymbol={cryptoSymbol ?? ''} />
  }
  if (cardKind === 'h2h_sport' && isLive) {
    return <LiveScoreStub />
  }
  if (cardKind === 'multi_outcome' && multiMarkets && multiMarkets.length > 0) {
    return <MultiLineChart markets={multiMarkets} />
  }
  const dualLine = cardKind === 'binary' || cardKind === 'h2h_sport'
  return <HistoryChart marketId={marketId} showBothLines={dualLine} />
}

function formatSpotPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
  if (price >= 1) return `$${price.toFixed(2)}`
  return `$${price.toFixed(4)}`
}

function LiveSpotView({ cryptoSymbol }: { cryptoSymbol: string }) {
  const { price, change24h, loading } = useCryptoLivePrice(cryptoSymbol, 'chainlink')
  const connected = price !== null

  return (
    <Container>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-2)',
        }}
      >
        <SectionTitle>
          <Coins size={12} style={{ display: 'inline', marginRight: 4 }} />
          Prezzo spot live · Chainlink
        </SectionTitle>
        {connected && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
            <strong
              style={{
                fontSize: 'var(--font-lg)',
                fontWeight: 800,
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatSpotPrice(price!)}
            </strong>
            {change24h !== null && (
              <span
                style={{
                  fontSize: 'var(--font-sm)',
                  fontWeight: 600,
                  color: change24h >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                }}
              >
                {change24h >= 0 ? '+' : ''}
                {change24h.toFixed(2)}%
              </span>
            )}
          </div>
        )}
      </div>

      {!cryptoSymbol ? (
        <CenteredBox height={140}>
          <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-muted)' }}>
            Asset non riconosciuto per questo evento.
          </span>
        </CenteredBox>
      ) : loading && !connected ? (
        <CenteredBox height={140}>
          <Loader2
            size={20}
            className="animate-spin"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <span style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-muted)' }}>
            Connessione live feed…
          </span>
        </CenteredBox>
      ) : (
        <CryptoCandleChart symbol={cryptoSymbol} />
      )}
    </Container>
  )
}

function LiveScoreStub() {
  return (
    <Container>
      <SectionTitle>
        <Activity size={12} style={{ display: 'inline', marginRight: 4 }} />
        Score live
      </SectionTitle>
      <CenteredBox height={180}>
        <span
          style={{
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          Score live disponibile in MA6 — integrazione provider sport-data.
          <br />
          <span style={{ fontSize: 'var(--font-xs)' }}>
            Per ora segui le probabilità nei mercati qui sotto.
          </span>
        </span>
      </CenteredBox>
    </Container>
  )
}
