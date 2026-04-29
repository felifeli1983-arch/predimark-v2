'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Layers } from 'lucide-react'
import { OrderBookPanel } from './OrderBookPanel'

interface Props {
  /** YES asset id (clobTokenIds[0]). Se null mostra empty state. */
  assetId: string | null
  /** Default open: true su desktop probabilmente, false su mobile. */
  defaultOpen?: boolean
}

/**
 * Sprint "Make Event Page Real" — order book in section collassabile.
 * Visibile sotto il chart in EventPageShell, default chiuso (non distrae)
 * ma aperto rivela depth bars live via WS CLOB.
 */
export function OrderBookExpander({ assetId, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-2) var(--space-3)',
          background: 'transparent',
          border: 'none',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
          fontSize: 'var(--font-sm)',
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
        aria-expanded={open}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Layers size={14} style={{ color: 'var(--color-text-muted)' }} />
          Libro ordini · live
        </span>
        {open ? (
          <ChevronUp size={14} style={{ color: 'var(--color-text-muted)' }} />
        ) : (
          <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
        )}
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
          <OrderBookPanel assetId={assetId} />
        </div>
      )}
    </section>
  )
}
