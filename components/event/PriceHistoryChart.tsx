'use client'

import { Activity, Coins, Loader2 } from 'lucide-react'
import type { CardKind } from '@/lib/polymarket/mappers'
import { useCryptoLivePrice } from '@/lib/ws/hooks/useCryptoLivePrice'
import { CenteredBox, Container, SectionTitle } from './chart/ChartShell'
import { HistoryChart } from './HistoryChart'
import { MultiLineChart, type MultiMarket } from './MultiLineChart'
import { CryptoCandleChart } from './CryptoCandleChart'
import { PolymarketEmbed } from './PolymarketEmbed'

interface Props {
  marketId: string
  cardKind?: CardKind
  /** Slug Polymarket del primo market — usato per l'iframe embed ufficiale. */
  marketSlug?: string
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
 * Router CardKind-aware per il chart event-page.
 *
 *  - crypto_up_down (con marketSlug) → PolymarketEmbed con liveactivity=true
 *    (round 5m/15m, mostra anche feed trade live sotto il chart)
 *  - binary | h2h_sport (non-live, con marketSlug) → PolymarketEmbed iframe
 *    ufficiale (chart identico a polymarket.com — niente da reinventare)
 *  - multi_outcome (con multiMarkets) → MultiLineChart custom (Polymarket
 *    embed iframe non supporta multi-event, dobbiamo costruirlo noi)
 *  - multi_strike → HistoryChart single-line YES
 *  - crypto_up_down (senza marketSlug) → LiveSpotView (Chainlink + Binance)
 *  - h2h_sport (live) → LiveScoreStub (sport-data MA6+)
 *  - fallback → HistoryChart custom
 */
export function PriceHistoryChart({
  marketId,
  cardKind = 'binary',
  marketSlug,
  cryptoSymbol,
  isLive,
  multiMarkets,
}: Props) {
  if (cardKind === 'crypto_up_down' && marketSlug) {
    // liveactivity=true → trade feed real-time sotto il chart Polymarket
    return <PolymarketEmbed marketSlug={marketSlug} liveActivity height={420} />
  }
  if (cardKind === 'crypto_up_down') {
    // Fallback: nessuno slug → spot price Chainlink
    return <LiveSpotView cryptoSymbol={cryptoSymbol ?? ''} />
  }
  if (cardKind === 'h2h_sport' && marketSlug) {
    // Endpoint /sports dedicato: layout team affiancati + win probability +
    // (per i live) score real-time. Funziona anche per partite future.
    return (
      <PolymarketEmbed marketSlug={marketSlug} kind="sports" liveActivity={isLive} height={420} />
    )
  }
  if (cardKind === 'h2h_sport' && isLive) {
    return <LiveScoreStub />
  }
  if (cardKind === 'multi_outcome' && multiMarkets && multiMarkets.length > 0) {
    return <MultiLineChart markets={multiMarkets} />
  }
  // Binary: embed standard Polymarket
  if (cardKind === 'binary' && marketSlug) {
    return <PolymarketEmbed marketSlug={marketSlug} liveActivity={isLive} />
  }
  // Fallback custom (multi_strike o cardKind senza slug)
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
