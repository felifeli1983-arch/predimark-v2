import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

interface PerformanceData {
  total_signals: number
  resolved_signals: number
  hits: number
  hit_rate: number
  avg_edge_claimed: number
  avg_edge_realized: number
  edge_realization_ratio: number
  by_algorithm: Array<{
    algorithm: string
    count: number
    hit_rate: number
  }>
}

/**
 * GET /api/v1/signals/performance — track record signals (pubblico, key for trust)
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('signals')
    .select('algorithm_name, status, was_correct, edge_pct, realized_edge_pct')
    .eq('status', 'resolved')

  if (error) {
    console.error('[signals performance]', error)
    return ERR('INTERNAL_ERROR', 'Errore lettura performance', 500)
  }

  const rows = data ?? []
  const total_signals = rows.length
  const hits = rows.filter((r) => r.was_correct === true).length
  const hit_rate = total_signals > 0 ? hits / total_signals : 0

  const claimedSum = rows.reduce((s, r) => s + Number(r.edge_pct ?? 0), 0)
  const realizedSum = rows.reduce((s, r) => s + Number(r.realized_edge_pct ?? 0), 0)
  const avg_edge_claimed = total_signals > 0 ? claimedSum / total_signals : 0
  const avg_edge_realized = total_signals > 0 ? realizedSum / total_signals : 0
  const edge_realization_ratio = avg_edge_claimed > 0 ? avg_edge_realized / avg_edge_claimed : 0

  // Aggregate by algorithm
  const byAlgo = new Map<string, { count: number; hits: number }>()
  for (const r of rows) {
    const algo = r.algorithm_name ?? 'unknown'
    const cur = byAlgo.get(algo) ?? { count: 0, hits: 0 }
    cur.count += 1
    if (r.was_correct) cur.hits += 1
    byAlgo.set(algo, cur)
  }
  const by_algorithm = Array.from(byAlgo.entries()).map(([algo, { count, hits }]) => ({
    algorithm: algo,
    count,
    hit_rate: count > 0 ? hits / count : 0,
  }))

  const response: PerformanceData = {
    total_signals,
    resolved_signals: total_signals,
    hits,
    hit_rate,
    avg_edge_claimed,
    avg_edge_realized,
    edge_realization_ratio,
    by_algorithm,
  }
  return NextResponse.json(response)
}
