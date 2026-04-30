'use client'

interface Props {
  /** Market slug (es. 'will-france-win-the-2026-fifa-world-cup-924'). */
  marketSlug: string
  /** Altezza iframe in px. Default 360 — buon compromesso tra spazio e densità. */
  height?: number
}

/**
 * Embed iframe ufficiale Polymarket.
 *
 * URL: https://embed.polymarket.com/market?market=<slug>&theme=dark&height=N
 * Verificato 2026-04-30: niente X-Frame-Options né CSP frame-ancestors,
 * iframe si carica da qualsiasi origin (incluso localhost).
 *
 * Limite: funziona solo per market SINGOLO (no event multi-outcome).
 * Per multi_outcome/multi_strike usiamo MultiLineChart custom.
 */
export function PolymarketEmbed({ marketSlug, height = 360 }: Props) {
  const src = `https://embed.polymarket.com/market?market=${encodeURIComponent(marketSlug)}&theme=dark&height=${height}`
  return (
    <div
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
    >
      <iframe
        title="Polymarket prediction market"
        src={src}
        width="100%"
        height={height}
        frameBorder={0}
        loading="lazy"
        allowTransparency
        style={{ display: 'block', border: 'none', width: '100%' }}
      />
    </div>
  )
}
