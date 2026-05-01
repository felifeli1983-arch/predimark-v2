'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react'

interface HealthResponse {
  ok: boolean
  upstream: {
    clobOk: boolean
    serverTime: number | null
    localTime: number
    clockSkewSec: number | null
    clockSkewWarn: boolean
  }
}

/**
 * Badge live CLOB Polymarket per /admin dashboard.
 * Doc Public Methods → getOk + getServerTime.
 *
 * Mostra:
 *  - ✅ Online / ❌ Down: status base CLOB
 *  - ⚠️ Clock skew >30s: warn se il nostro server è desync rispetto al
 *    Polymarket server (causerebbe GTD off-by-X o signed orders rifiutati).
 */
export function ClobHealthBadge() {
  const [data, setData] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/v1/polymarket/health', { cache: 'no-store' })
        const body = (await res.json()) as HealthResponse
        if (!cancelled) {
          setData(body)
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    const id = setInterval(load, 60_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  if (loading) {
    return (
      <span style={badgeStyle('var(--color-text-muted)')}>
        <Loader2 size={11} className="animate-spin" /> CLOB…
      </span>
    )
  }
  if (!data) return null

  const { clobOk, clockSkewSec, clockSkewWarn } = data.upstream
  if (!clobOk) {
    return (
      <span style={badgeStyle('var(--color-danger)')}>
        <XCircle size={11} /> CLOB OFFLINE
      </span>
    )
  }
  if (clockSkewWarn) {
    return (
      <span
        style={badgeStyle('var(--color-warning)')}
        title={`Clock skew ${clockSkewSec}s — GTD orders potrebbero scadere fuori sincrono`}
      >
        <AlertTriangle size={11} /> CLOCK SKEW {clockSkewSec}s
      </span>
    )
  }
  return (
    <span style={badgeStyle('var(--color-success)')}>
      <CheckCircle2 size={11} /> CLOB OK
    </span>
  )
}

function badgeStyle(color: string): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    background: `color-mix(in srgb, ${color} 14%, transparent)`,
    color,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: '0.04em',
  }
}
