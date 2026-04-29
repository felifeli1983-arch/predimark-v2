'use client'

import { useThemeStore } from '@/lib/stores/themeStore'
import { Sparkles } from 'lucide-react'

/**
 * Banner top-page mostrato quando isDemo=true.
 * Comunica chiaramente che siamo in modalità simulata, no soldi reali.
 * Non si mostra in REAL mode (zero footprint visivo).
 */
export function DemoModeBanner() {
  const isDemo = useThemeStore((s) => s.isDemo)

  if (!isDemo) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-1) var(--space-3)',
        background: 'color-mix(in srgb, var(--color-warning) 14%, transparent)',
        borderBottom: '1px solid var(--color-warning)',
        color: 'var(--color-warning)',
        fontSize: 'var(--font-xs)',
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      <Sparkles size={12} />
      <span>Modalità DEMO — stai usando $10k virtuali, no soldi reali</span>
    </div>
  )
}
