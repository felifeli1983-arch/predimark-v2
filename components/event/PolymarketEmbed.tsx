'use client'

interface Props {
  /** Market slug (es. 'will-france-win-the-2026-fifa-world-cup-924'). */
  marketSlug: string
  /** Altezza iframe in px. Default 360 — buon compromesso tra spazio e densità. */
  height?: number
  /**
   * Attiva il pannello "live activity" sotto il chart (utile per crypto
   * round 5m/15m e sport in corso — mostra trade live in tempo reale).
   */
  liveActivity?: boolean
}

/**
 * Builder code Auktora — fee attribution Polymarket. Fallback al builder
 * code dell'esempio crypto live nella documentazione (no attribution per
 * noi finché non lo settiamo via env).
 */
const BUILDER_CODE = process.env.NEXT_PUBLIC_POLYMARKET_BUILDER_CODE ?? ''

/**
 * Embed iframe ufficiale Polymarket.
 *
 * URL: https://embed.polymarket.com/market?market=<slug>&theme=dark&height=N
 * Verificato 2026-04-30: niente X-Frame-Options né CSP frame-ancestors,
 * iframe si carica da qualsiasi origin (incluso localhost).
 *
 * Params supportati:
 *  - market: slug del market (REQUIRED)
 *  - theme: dark | light
 *  - height: px (in URL serve a Polymarket per layout interno)
 *  - liveactivity: true → mostra feed trade real-time sotto il chart
 *  - creator: <builder-code> → fee attribution per i trade fatti via embed
 *
 * Limite: funziona solo per market SINGOLO (no event multi-outcome).
 */
export function PolymarketEmbed({ marketSlug, height = 360, liveActivity }: Props) {
  const params = new URLSearchParams({
    market: marketSlug,
    theme: 'dark',
    height: String(height),
  })
  if (liveActivity) params.set('liveactivity', 'true')
  if (BUILDER_CODE) params.set('creator', BUILDER_CODE)
  const src = `https://embed.polymarket.com/market?${params.toString()}`
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
