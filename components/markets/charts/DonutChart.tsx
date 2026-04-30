interface DonutChartProps {
  probability: number // 0..1
  size?: number
  strokeWidth?: number
  color?: string
  /**
   * Etichette outcome custom — default ["Yes", "No"]. Es. ["Up", "Down"]
   * per crypto round, ["Spain","Other"] per multi-outcome focused, ecc.
   * `labels[0]` mostrato quando probability ≥ 0.5, `labels[1]` altrimenti.
   */
  labels?: [string, string]
}

export function DonutChart({
  probability,
  size = 80,
  strokeWidth = 10,
  color,
  labels = ['Yes', 'No'],
}: DonutChartProps) {
  const clamped = Math.max(0, Math.min(1, probability))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  // Mostra sempre il LATO DOMINANTE (probability più alta), con colore
  // ed etichetta corrispondenti. Se Up=16% / Down=84% → renderizza
  // "84% Down" rosso (non "16% Down" che era buggato e fuorviante).
  const isYes = clamped >= 0.5
  const dominantProb = isYes ? clamped : 1 - clamped
  const dashOffset = circumference * (1 - dominantProb)
  const arcColor = color ?? (isYes ? 'var(--color-success)' : 'var(--color-danger)')
  const labelColor = arcColor
  const label = isYes ? labels[0] : labels[1]
  const percent = Math.round(dominantProb * 100)

  // Font ridotti di 2 punti per evitare che debordino dal cerchio
  // (size 80 → percentuale 18px, label 9px)
  const pctFontSize = Math.round(size * 0.22)
  const labelFontSize = Math.round(size * 0.12)

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`${percent}% ${label}`}
    >
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--color-bg-tertiary)"
        strokeWidth={strokeWidth}
      />
      {/* Arco valore */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={arcColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />
      {/* Percentuale */}
      <text
        x={center}
        y={center - 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--color-text-primary)"
        fontSize={pctFontSize}
        fontWeight={700}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {percent}%
      </text>
      {/* Etichetta Yes/No */}
      <text
        x={center}
        y={center + pctFontSize * 0.7}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={labelColor}
        fontSize={labelFontSize}
        fontWeight={600}
      >
        {label}
      </text>
    </svg>
  )
}
