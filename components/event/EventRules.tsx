'use client'

import { useState } from 'react'
import { ChevronDown, FileText } from 'lucide-react'

interface Props {
  description: string
}

const COLLAPSED_PREVIEW_CHARS = 240

/**
 * Sezione Rules / Regole — visibile sempre sopra la lista candidati,
 * non più nascosta in tab. Long descriptions sono collassate con
 * preview + "Read more".
 */
export function EventRules({ description }: Props) {
  const [expanded, setExpanded] = useState(false)
  const text = description?.trim()
  const isLong = text && text.length > COLLAPSED_PREVIEW_CHARS
  const visible = !isLong || expanded ? text : `${text.slice(0, COLLAPSED_PREVIEW_CHARS)}…`

  return (
    <section
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 12,
        padding: 14,
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <FileText size={14} style={{ color: 'var(--color-text-muted)' }} />
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
          Regole
        </h3>
      </header>
      {text ? (
        <>
          <p
            style={{
              margin: 0,
              color: 'var(--color-text-secondary)',
              fontSize: 13,
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
                marginTop: 6,
                background: 'none',
                border: 'none',
                color: 'var(--color-cta)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
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
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 12 }}>
          Regole non disponibili per questo mercato.
        </p>
      )}
    </section>
  )
}
