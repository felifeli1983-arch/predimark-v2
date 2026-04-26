'use client'

import { Zap } from 'lucide-react'

interface Props {
  isDemo: boolean
  onToggle: () => void
}

export function RealDemoToggle({ isDemo, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDemo ? 'Passa a REAL' : 'Passa a DEMO'}
      style={{
        flexShrink: 0,
        /* width fisso: REAL e DEMO occupano sempre lo stesso spazio */
        width: '70px',
        justifyContent: 'center',
        background: isDemo ? 'var(--color-warning-bg)' : 'var(--color-cta-bg)',
        color: isDemo ? 'var(--color-warning)' : 'var(--color-cta)',
        border: `1px solid ${isDemo ? 'var(--color-warning)' : 'var(--color-cta)'}`,
        borderRadius: '6px',
        padding: '5px 8px',
        fontSize: '11px',
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        letterSpacing: '0.05em',
      }}
    >
      <Zap size={11} />
      {isDemo ? 'DEMO' : 'REAL'}
    </button>
  )
}
