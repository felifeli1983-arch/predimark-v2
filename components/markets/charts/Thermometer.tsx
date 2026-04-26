/**
 * Thermometer — barra verticale Up/Down per Crypto card.
 * Pure SVG, nessun WS. Riceve `upProbability` (0-1) come prop.
 */

interface ThermometerProps {
  upProbability: number // 0..1
  width?: number
  height?: number
}

export function Thermometer({ upProbability, width = 28, height = 80 }: ThermometerProps) {
  const clamped = Math.max(0, Math.min(1, upProbability))
  const upHeight = clamped * height
  const downHeight = height - upHeight

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Up ${Math.round(clamped * 100)}%`}
    >
      {/* Track */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={width / 2}
        fill="var(--color-bg-tertiary)"
      />
      {/* Down (in basso, rosso) */}
      <rect
        x={0}
        y={upHeight}
        width={width}
        height={downHeight}
        fill="var(--color-danger)"
        opacity={0.85}
        rx={width / 2}
      />
      {/* Up (in alto, verde, sopra il rosso) */}
      <rect
        x={0}
        y={0}
        width={width}
        height={upHeight}
        fill="var(--color-success)"
        opacity={0.95}
        rx={width / 2}
      />
      {/* Linea centrale 50% per riferimento */}
      <line
        x1={0}
        x2={width}
        y1={height / 2}
        y2={height / 2}
        stroke="var(--color-border-strong)"
        strokeWidth={1}
        strokeDasharray="2 2"
        opacity={0.4}
      />
    </svg>
  )
}
