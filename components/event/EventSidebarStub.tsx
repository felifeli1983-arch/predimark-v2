'use client'

import { Sparkles, Target } from 'lucide-react'
import type { AuktoraEvent } from '@/lib/polymarket/mappers'

interface Props {
  event: AuktoraEvent
  layout: 'sidebar' | 'inline'
}

/**
 * Sidebar event-page stubs — Segnale Auktora + Mercati correlati.
 *
 * Il Trade Widget reale è ora montato direttamente da `EventPageShell`:
 * - desktop ≥lg: come slot sidebar di `<PageContainer>`
 * - mobile <lg: come bottom sheet (visibility controllata da `useTradeWidget.isOpen`)
 *
 * Quando layout='inline' (mobile dentro main column) mostra solo i 2 stub.
 */
export function EventSidebarStub({ layout }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        paddingBottom: layout === 'sidebar' ? 24 : 0,
      }}
    >
      <SignalStub />
      <RelatedStub />
    </div>
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
        Mercati correlati — disponibile in MA5.
      </p>
    </section>
  )
}
