'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { AuktoraEvent, AuktoraMarket, AuktoraOutcome } from '@/lib/polymarket/mappers'
import { PageContainer } from '@/components/layout/PageContainer'
import { tradeWidgetActions, type TradeDraft } from '@/lib/stores/useTradeWidget'
import { TradeWidget } from '@/components/trade/TradeWidget'
import { EventHero } from './EventHero'
import { EventProbabilities } from './EventProbabilities'
import { EventInfoTabs } from './EventInfoTabs'
import { EventRules } from './EventRules'
import { EventSidebarStub } from './EventSidebarStub'
import { EventTradeBoot } from './EventTradeBoot'
import { SignalBanner } from './SignalBanner'
import { PriceHistoryChart } from './PriceHistoryChart'
import { CryptoRoundNav } from './CryptoRoundNav'
import { OrderBookExpander } from './OrderBookExpander'
import { SentimentCard } from './SentimentCard'
import { RelatedMarkets } from './RelatedMarkets'

interface Props {
  event: AuktoraEvent
}

/** Estrae il simbolo crypto dallo slug+titolo per il feed Chainlink. */
function extractCryptoSymbol(slug: string, title: string): string {
  const text = `${slug} ${title}`.toLowerCase()
  if (text.includes('btc') || text.includes('bitcoin')) return 'btcusdt'
  if (text.includes('eth') || text.includes('ethereum')) return 'ethusdt'
  if (text.includes('sol') || text.includes('solana')) return 'solusdt'
  if (text.includes('matic') || text.includes('polygon')) return 'maticusdt'
  return ''
}

export function EventPageShell({ event }: Props) {
  const primaryTag = event.tags[0] ?? 'all'
  const isResolved = event.closed
  const cryptoSymbol =
    event.kind === 'crypto_up_down' ? extractCryptoSymbol(event.slug, event.title) : undefined
  const multiMarkets =
    event.kind === 'multi_outcome'
      ? [...event.markets]
          .sort((a, b) => b.yesPrice - a.yesPrice)
          .slice(0, 5)
          .map((m) => ({
            tokenId: m.clobTokenIds?.[0] ?? '',
            label: m.groupItemTitle || m.question,
          }))
          .filter((m) => m.tokenId !== '')
      : undefined

  function openTradeWidget(marketId: string, side: string) {
    const market = event.markets.find((m) => m.id === marketId)
    if (!market) return
    const draft = buildDraft(event, market, side)
    if (!draft) return
    tradeWidgetActions.setDraft(draft)
    tradeWidgetActions.open()
  }

  return (
    <>
      <Suspense fallback={null}>
        <EventTradeBoot event={event} />
      </Suspense>
      <PageContainer
        sidebar={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 24 }}>
            <TradeWidget layout="sidebar" />
            <SentimentCard event={event} />
            {primaryTag !== 'all' && (
              <RelatedMarkets primaryTag={primaryTag} excludeId={event.id} />
            )}
          </div>
        }
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: '12px var(--layout-padding-x) 0',
          }}
        >
          {/* Mobile: back. Desktop: breadcrumb */}
          <div className="md:hidden">
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-base)',
                textDecoration: 'none',
              }}
            >
              <ChevronLeft size={14} />
              Indietro
            </Link>
          </div>
          <nav
            aria-label="breadcrumb"
            className="hidden md:flex"
            style={{
              alignItems: 'center',
              gap: 6,
              fontSize: 'var(--font-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              Home
            </Link>
            <ChevronRight size={12} />
            <Link
              href={`/?category=${encodeURIComponent(primaryTag)}`}
              style={{ color: 'inherit', textDecoration: 'none', textTransform: 'capitalize' }}
            >
              {primaryTag}
            </Link>
            <ChevronRight size={12} />
            <span
              style={{
                color: 'var(--color-text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {event.title}
            </span>
          </nav>

          {isResolved && <ResolvedBanner />}

          <EventHero event={event} />
          {event.markets[0] && <SignalBanner marketId={event.markets[0].id} />}
          {event.markets[0]?.clobTokenIds?.[0] && (
            <PriceHistoryChart
              marketId={event.markets[0].clobTokenIds[0]}
              cardKind={event.kind}
              cryptoSymbol={cryptoSymbol}
              isLive={event.active && !event.closed}
              multiMarkets={multiMarkets}
            />
          )}
          {event.kind === 'crypto_up_down' && event.seriesSlug && (
            <CryptoRoundNav seriesSlug={event.seriesSlug} currentSlug={event.slug} />
          )}
          {event.markets[0]?.clobTokenIds?.[0] && (
            <OrderBookExpander assetId={event.markets[0].clobTokenIds[0]} />
          )}
          <EventProbabilities event={event} onTrade={openTradeWidget} />
          <EventRules description={event.description} />
          {/* Sidebar inline su mobile + tablet portrait (<1024px) — Sentiment + Related,
            Trade Widget mobile arriva via bottom sheet */}
          <div className="lg:hidden">
            <EventSidebarStub event={event} layout="inline" />
          </div>
          <EventInfoTabs event={event} />
        </div>
      </PageContainer>
      {/* Bottom sheet mobile — fuori dalla grid per overlay full-width */}
      <div className="lg:hidden">
        <TradeWidget layout="sheet" />
      </div>
    </>
  )
}

/** Costruisce il draft per il widget a partire da event/market/side. */
function buildDraft(event: AuktoraEvent, market: AuktoraMarket, side: string): TradeDraft | null {
  const lower = side.toLowerCase()
  let priceAtAdd: number
  let outcomeLabel: string
  let tokenId: string | null = null

  if (lower === 'yes' || lower === 'up') {
    priceAtAdd = market.yesPrice
    outcomeLabel = lower === 'up' ? 'Up' : 'Yes'
    tokenId = market.clobTokenIds?.[0] ?? null
  } else if (lower === 'no' || lower === 'down') {
    priceAtAdd = market.noPrice
    outcomeLabel = lower === 'down' ? 'Down' : 'No'
    tokenId = market.clobTokenIds?.[1] ?? null
  } else {
    const outcome: AuktoraOutcome | undefined = market.outcomes.find(
      (o) => o.name.toLowerCase() === lower
    )
    if (!outcome) return null
    priceAtAdd = outcome.price
    outcomeLabel = outcome.name
    // Outcome multi-outcome: assumiamo che il primo token id corrisponda al "Yes" del candidato selezionato
    tokenId = market.clobTokenIds?.[0] ?? null
  }

  if (priceAtAdd <= 0 || priceAtAdd >= 1) return null

  return {
    polymarketMarketId: market.id,
    polymarketEventId: event.id,
    slug: event.slug,
    title: event.title,
    cardKind: event.kind,
    category: event.tags[0] ?? 'general',
    side: lower,
    pricePerShare: priceAtAdd,
    outcomeLabel,
    tokenId,
    clobTokenIds: market.clobTokenIds,
  }
}

function ResolvedBanner() {
  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-warning-bg)',
        border: '1px solid var(--color-warning)',
        color: 'var(--color-warning)',
        fontSize: 'var(--font-sm)',
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
    >
      Resolved · mercato chiuso
    </div>
  )
}
