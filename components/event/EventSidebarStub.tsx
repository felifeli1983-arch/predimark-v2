'use client'

import { Sparkles, Target, Wallet } from 'lucide-react'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'

interface Props {
  event: AuktoraEvent
  layout: 'sidebar' | 'inline'
}

export function EventSidebarStub({ event, layout }: Props) {
  const market = event.markets[0]
  const yesPct = market ? Math.round(market.yesPrice * 100) : 50

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxHeight: layout === 'sidebar' ? '100vh' : 'none',
        overflowY: layout === 'sidebar' ? 'auto' : 'visible',
        paddingBottom: layout === 'sidebar' ? 24 : 0,
      }}
    >
      <TradeWidgetStub yesPct={yesPct} />
      <SignalStub />
      <RelatedStub />
    </div>
  )
}

function TradeWidgetStub({ yesPct }: { yesPct: number }) {
  return (
    <section
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-cta)',
        borderRadius: 12,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Wallet size={14} style={{ color: 'var(--color-cta)' }} />
        <h3
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Trade Widget
        </h3>
      </div>
      <div
        style={{
          padding: '20px 12px',
          borderRadius: 8,
          background: 'var(--color-bg-tertiary)',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 12,
        }}
      >
        <div style={{ marginBottom: 8 }}>
          Yes <strong style={{ color: 'var(--color-success)' }}>{yesPct}%</strong>
        </div>
        Trade Widget — disponibile in MA4
      </div>
    </section>
  )
}

function SignalStub() {
  return (
    <section
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Target size={14} style={{ color: 'var(--color-warning)' }} />
        <h3
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Segnale Auktora
        </h3>
      </div>
      <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
        Segnale algoritmico — disponibile in MA5.
      </p>
    </section>
  )
}

function RelatedStub() {
  return (
    <section
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Sparkles size={14} style={{ color: 'var(--color-cta)' }} />
        <h3
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Mercati correlati
        </h3>
      </div>
      <p style={{ margin: 0, fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.55 }}>
        Mercati correlati — disponibile in MA4.
      </p>
    </section>
  )
}
