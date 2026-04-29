import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

interface CalibrationBucket {
  predicted_range: string
  predicted_avg: number
  actual_rate: number
  count: number
}

/**
 * GET /api/v1/users/me/calibration
 * Sprint 5.3.3 + N1 — Calibration curve data.
 *
 * Logica:
 * 1. Fetch resolved positions del user (is_open=false, current_price IS NOT NULL)
 * 2. Group by bucket: 0-10%, 10-20%, ..., 90-100% (probabilità entry)
 * 3. Per ogni bucket: count, predicted_avg (avg di avg_price), actual_rate (% wins)
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const supabase = createAdminClient()
  const { data: positions, error } = await supabase
    .from('positions')
    .select('avg_price, current_price, current_value, total_cost')
    .eq('user_id', auth.userId)
    .eq('is_open', false)
    .not('current_price', 'is', null)
    .limit(1000)

  if (error) {
    console.error('[calibration]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura positions', 500)
  }

  if (!positions || positions.length === 0) {
    return NextResponse.json({ buckets: [], total_resolved: 0 })
  }

  // Bucket 10% width: 0-0.1, 0.1-0.2, ..., 0.9-1.0
  const buckets = new Map<string, { sumPredicted: number; wins: number; count: number }>()
  for (const p of positions) {
    const predicted = Number(p.avg_price ?? 0)
    if (predicted <= 0 || predicted >= 1) continue
    const isWin = Number(p.current_price ?? 0) > 0.5
    const bucket = Math.floor(predicted * 10) / 10
    const key = `${(bucket * 100).toFixed(0)}-${((bucket + 0.1) * 100).toFixed(0)}%`
    const cur = buckets.get(key) ?? { sumPredicted: 0, wins: 0, count: 0 }
    cur.sumPredicted += predicted
    cur.count += 1
    if (isWin) cur.wins += 1
    buckets.set(key, cur)
  }

  const result: CalibrationBucket[] = Array.from(buckets.entries())
    .map(([range, data]) => ({
      predicted_range: range,
      predicted_avg: data.count > 0 ? data.sumPredicted / data.count : 0,
      actual_rate: data.count > 0 ? data.wins / data.count : 0,
      count: data.count,
    }))
    .filter((b) => b.count >= 1) // include all (was: 3) — visible anche con pochi trade
    .sort((a, b) => a.predicted_avg - b.predicted_avg)

  return NextResponse.json({
    buckets: result,
    total_resolved: positions.length,
  })
}
