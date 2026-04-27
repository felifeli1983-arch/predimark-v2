'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'
import { PageContainer } from '@/components/layout/PageContainer'
import { EventHero } from './EventHero'
import { EventProbabilities } from './EventProbabilities'
import { EventInfoTabs } from './EventInfoTabs'
import { EventSidebarStub } from './EventSidebarStub'

interface Props {
  event: AuktoraEvent
}

// TODO MA4.3: collegare a TradeWidget single-market (DEMO mode insert in `trades`)
function handleTradeStub(eventId: string, marketId: string, side: string) {
  console.warn('[Trade stub MA4.3]', eventId, marketId, side)
}

export function EventPageShell({ event }: Props) {
  const primaryTag = event.tags[0] ?? 'all'
  const isResolved = event.closed

  return (
    <PageContainer sidebar={<EventSidebarStub event={event} layout="sidebar" />}>
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
        <EventProbabilities event={event} onTrade={handleTradeStub} />
        {/* Sidebar inline su mobile + tablet portrait (<1024px) */}
        <div className="lg:hidden">
          <EventSidebarStub event={event} layout="inline" />
        </div>
        <EventInfoTabs event={event} />
      </div>
    </PageContainer>
  )
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
