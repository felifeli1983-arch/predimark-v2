'use client'

import { useState } from 'react'
import { ChevronDown, ExternalLink, FileText, ShieldCheck } from 'lucide-react'

interface Props {
  description: string
  /** URL sorgente UMA (Chainlink/ESPN/etc.) — chip esterno se presente. */
  resolutionSource?: string
  /** True quando market.closed = true → mostra banner "Risolto, trading chiuso". */
  isResolved?: boolean
  /** Date risoluzione (= endDate effettivo se closed). */
  resolvedAt?: Date | null
}

const COLLAPSED_PREVIEW_CHARS = 240

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/**
 * Sezione Rules / Regole — visibile sempre sopra la lista candidati,
 * non più nascosta in tab. Long descriptions sono collassate con
 * preview + "Read more".
 *
 * Mostra chip "Sorgente: chainlink.com" linkato (Polymarket "Resolution"
 * doc: "Always read the resolution rules before trading"). Se il market
 * è risolto, banner verde con date + UMA Oracle Portal link.
 */
export function EventRules({ description, resolutionSource, isResolved, resolvedAt }: Props) {
  const [expanded, setExpanded] = useState(false)
  const text = description?.trim()
  const isLong = text && text.length > COLLAPSED_PREVIEW_CHARS
  const visible = !isLong || expanded ? text : `${text.slice(0, COLLAPSED_PREVIEW_CHARS)}…`

  return (
    <section
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-2)',
          flexWrap: 'wrap',
        }}
      >
        <FileText size={14} style={{ color: 'var(--color-text-muted)' }} />
        <h3
          style={{
            margin: 0,
            fontSize: 'var(--font-sm)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Regole
        </h3>
        {resolutionSource && (
          <a
            href={resolutionSource}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border-subtle)',
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-secondary)',
              textDecoration: 'none',
            }}
          >
            <ShieldCheck size={10} style={{ color: 'var(--color-success)' }} />
            Sorgente: {hostname(resolutionSource)}
            <ExternalLink size={9} />
          </a>
        )}
      </header>

      {isResolved && (
        <div
          style={{
            marginBottom: 'var(--space-3)',
            padding: '8px 12px',
            background: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-success) 40%, transparent)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>
            ✓ Mercato risolto
          </span>
          {resolvedAt && (
            <span
              style={{
                fontSize: 'var(--font-xs)',
                color: 'var(--color-text-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {resolvedAt.toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          )}
          <span
            style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            · Trading chiuso · I winning tokens sono redimibili
          </span>
          <a
            href="https://oracle.uma.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: 'auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 'var(--font-xs)',
              color: 'var(--color-cta)',
              textDecoration: 'none',
            }}
          >
            UMA Portal <ExternalLink size={9} />
          </a>
        </div>
      )}
      {text ? (
        <>
          <p
            style={{
              margin: 0,
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-base)',
              lineHeight: 1.55,
              whiteSpace: 'pre-wrap',
            }}
          >
            {visible}
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              style={{
                marginTop: 'var(--space-1)',
                background: 'none',
                border: 'none',
                color: 'var(--color-cta)',
                fontSize: 'var(--font-sm)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                padding: 0,
              }}
            >
              {expanded ? 'Mostra meno' : 'Read more'}
              <ChevronDown
                size={12}
                style={{
                  transform: expanded ? 'rotate(180deg)' : 'none',
                  transition: 'transform 150ms',
                }}
              />
            </button>
          )}
        </>
      ) : (
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--font-sm)' }}>
          Regole non disponibili per questo mercato.
        </p>
      )}
    </section>
  )
}
