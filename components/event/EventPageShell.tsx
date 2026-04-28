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

interface Props {
  event: AuktoraEvent
}

export function EventPageShell({ event }: Props) {
  const primaryTag = event.tags[0] ?? 'all'
  const isResolved = event.closed

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
      <PageContainer sidebar={<TradeWidget layout="sidebar" />}>
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
                fontSize: 13,
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
              fontSize: 12,
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
          <ChartHistoryStub />
          <EventProbabilities event={event} onTrade={openTradeWidget} />
          <EventRules description={event.description} />
          {/* Sidebar inline su mobile + tablet portrait (<1024px) — solo Segnale + Mercati correlati,
            Trade Widget mobile arriva via bottom sheet */}
          <div className="lg:hidden">
            <EventSidebarStub event={event} layout="inline" />
          </div>
          <EventInfoTabs />
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

  if (lower === 'yes' || lower === 'up') {
    priceAtAdd = market.yesPrice
    outcomeLabel = lower === 'up' ? 'Up' : 'Yes'
  } else if (lower === 'no' || lower === 'down') {
    priceAtAdd = market.noPrice
    outcomeLabel = lower === 'down' ? 'Down' : 'No'
  } else {
    const outcome: AuktoraOutcome | undefined = market.outcomes.find(
      (o) => o.name.toLowerCase() === lower
    )
    if (!outcome) return null
    priceAtAdd = outcome.price
    outcomeLabel = outcome.name
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
  }
}

function ResolvedBanner() {
  return (
    <div
      style={{
        padding: '10px 14px',
        borderRadius: 8,
        background: 'var(--color-warning-bg)',
        border: '1px solid var(--color-warning)',
        color: 'var(--color-warning)',
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
    >
      Resolved · mercato chiuso
    </div>
  )
}

function ChartHistoryStub() {
  return (
    <div
      style={{
        height: 200,
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-muted)',
        fontSize: 13,
      }}
    >
      Chart storico — disponibile in Sprint 3.5.2
    </div>
  )
}
