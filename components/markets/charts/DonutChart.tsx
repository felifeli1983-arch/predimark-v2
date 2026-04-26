interface DonutChartProps {
  probability: number // 0..1
  size?: number
  strokeWidth?: number
  color?: string
}

export function DonutChart({ probability, size = 80, strokeWidth = 10, color }: DonutChartProps) {
  const clamped = Math.max(0, Math.min(1, probability))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - clamped)
  const center = size / 2

  const isYes = clamped >= 0.5
  const arcColor = color ?? (isYes ? 'var(--color-success)' : 'var(--color-danger)')
  const labelColor = arcColor
  const label = isYes ? 'Yes' : 'No'
  const percent = Math.round(clamped * 100)

  const pctFontSize = Math.round(size * 0.26)
  const labelFontSize = Math.round(size * 0.14)

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
