import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchEventById } from '@/lib/polymarket/queries'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

interface MarketRow {
  id: string
  polymarket_market_id: string
  polymarket_event_id: string | null
  is_active: boolean | null
}

/**
 * GET /api/v1/cron/sync-price-history
 *
 * Snapshot prezzi correnti per ogni market locale `is_active`. Inserisce
 * una riga in `price_history` per ciascun market con yes/no price corrente
 * letto da Polymarket Gamma API.
 *
 * Schedulato ogni 6h (vercel.json). Storia ricostruita progressivamente:
 * 7d ≈ 28 punti, 30d ≈ 120 punti, sufficienti per chart leggibile.
 *
 * Auth: header `Authorization: Bearer ${CRON_SECRET}` (Vercel Cron).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return ERR('AUTH_INVALID', 'Cron secret invalid', 401)
  }

  const supabase = createAdminClient()

  const { data: marketsRaw, error: marketsErr } = await supabase
    .from('markets')
    .select('id, polymarket_market_id, polymarket_event_id, is_active')
    .eq('is_active', true)
    .limit(500)

  if (marketsErr) {
    console.error('[cron sync-price-history] markets fetch', marketsErr)
    return ERR('INTERNAL_ERROR', 'Errore fetch markets', 500)
  }

  const markets = (marketsRaw ?? []) as MarketRow[]
  if (markets.length === 0) {
    return NextResponse.json({ ok: true, processed: 0, inserted: 0 })
  }

  // Raggruppa per polymarket_event_id per ridurre chiamate Gamma (un fetch
  // per evento serve i prezzi di tutti i market dell'evento).
  const byEvent = new Map<string, MarketRow[]>()
  for (const m of markets) {
    if (!m.polymarket_event_id) continue
    const list = byEvent.get(m.polymarket_event_id) ?? []
    list.push(m)
    byEvent.set(m.polymarket_event_id, list)
  }

  const recordedAt = new Date().toISOString()
  let inserted = 0
  let errored = 0

  for (const [eventId, eventMarkets] of byEvent) {
    let raw
    try {
      raw = await fetchEventById(eventId)
    } catch (err) {
      console.error('[cron sync-price-history] gamma fetch', eventId, err)
      errored += eventMarkets.length
      continue
    }
    if (!raw) {
      errored += eventMarkets.length
      continue
    }

    const priceByMarketId = new Map<string, { yes: number; no: number }>()
    for (const gm of raw.markets ?? []) {
      let yes = 0
      let no = 0
      try {
        const arr = JSON.parse(gm.outcomePrices ?? '[]') as unknown
        if (Array.isArray(arr) && arr.length >= 2) {
          yes = Number(arr[0]) || 0
          no = Number(arr[1]) || 0
        }
      } catch {
        // ignore — lascia 0/0
      }
      priceByMarketId.set(String(gm.id), { yes, no })
    }

    const rows: Array<{
      market_id: string
      recorded_at: string
      yes_price: number
      no_price: number
    }> = []
    for (const m of eventMarkets) {
      const prices = priceByMarketId.get(m.polymarket_market_id)
      if (!prices) continue
      rows.push({
        market_id: m.id,
        recorded_at: recordedAt,
        yes_price: prices.yes,
        no_price: prices.no,
      })
    }

    if (rows.length === 0) continue

    const { error: insErr } = await supabase
      .from('price_history')
      .upsert(rows, { onConflict: 'market_id,recorded_at' })

    if (insErr) {
      console.error('[cron sync-price-history] upsert', eventId, insErr)
      errored += rows.length
    } else {
      inserted += rows.length
    }
  }

  return NextResponse.json({
    ok: true,
    processed: markets.length,
    inserted,
    errored,
    skipped_no_event: markets.filter((m) => !m.polymarket_event_id).length,
  })
}
