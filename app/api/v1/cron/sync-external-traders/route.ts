import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

const POLYMARKET_DATA_BASE = process.env.POLYMARKET_DATA_URL ?? 'https://data-api.polymarket.com'

interface PolymarketTrade {
  user?: string
  proxyWallet?: string
  side?: string
  price?: number
  size?: number
  timestamp?: number
}

/**
 * GET /api/v1/cron/sync-external-traders
 *
 * Sprint 6.4.2 — Cron import-polymarket-leaderboard.
 * Daily 04:00 UTC (vercel.json).
 *
 * Logica:
 * 1. Fetch top trades dal Data API Polymarket (last 30d, paginato)
 * 2. Aggrega per wallet: total_volume, total_pnl, trades_count, win_rate
 * 3. Upsert top 100 in `external_traders` con rank_30d/all_time
 *
 * Auth: header `Authorization: Bearer ${CRON_SECRET}`.
 *
 * Note: Polymarket Data API endpoints non sempre stabili. Se fetch fail,
 * ritorna ok con processed: 0. Il job NON deve crashare il deploy.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return ERR('AUTH_INVALID', 'Cron secret invalid', 401)
  }

  try {
    // Best-effort fetch top traders da Polymarket Data API
    const url = `${POLYMARKET_DATA_BASE}/trades?limit=10000&order=volume`
    const res = await fetch(url, { signal: AbortSignal.timeout(30_000) })

    if (!res.ok) {
      return NextResponse.json({
        ok: true,
        processed: 0,
        message: `Polymarket Data API ${res.status} — skipping sync`,
      })
    }

    const trades = (await res.json()) as PolymarketTrade[]
    if (!Array.isArray(trades) || trades.length === 0) {
      return NextResponse.json({ ok: true, processed: 0, message: 'no trades' })
    }

    // Aggrega per wallet
    type Aggr = {
      wallet: string
      volume: number
      pnl: number
      trades_count: number
      wins: number
      last_trade: number
    }
    const byWallet = new Map<string, Aggr>()
    for (const t of trades) {
      const wallet = (t.user ?? t.proxyWallet ?? '').toLowerCase()
      if (!wallet || !wallet.startsWith('0x')) continue
      const cur = byWallet.get(wallet) ?? {
        wallet,
        volume: 0,
        pnl: 0,
        trades_count: 0,
        wins: 0,
        last_trade: 0,
      }
      const size = Number(t.size ?? 0)
      const price = Number(t.price ?? 0)
      cur.volume += size * price
      cur.trades_count += 1
      cur.last_trade = Math.max(cur.last_trade, Number(t.timestamp ?? 0))
      // pnl + wins richiedono outcome — placeholder (Polymarket trades non sempre includono pnl)
      byWallet.set(wallet, cur)
    }

    const top = Array.from(byWallet.values())
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 100)

    const supabase = createAdminClient()
    let upserted = 0

    for (let i = 0; i < top.length; i++) {
      const t = top[i]
      if (!t) continue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('external_traders') as any).upsert(
        {
          wallet_address: t.wallet,
          polymarket_volume_total: t.volume,
          polymarket_pnl_total: t.pnl,
          trades_count: t.trades_count,
          win_rate: t.trades_count > 0 ? t.wins / t.trades_count : null,
          rank_30d: i + 1,
          rank_all_time: i + 1,
          is_active: true,
          is_blocked: false,
          last_synced_at: new Date().toISOString(),
          last_trade_at: t.last_trade ? new Date(t.last_trade * 1000).toISOString() : null,
        },
        { onConflict: 'wallet_address' }
      )
      if (!error) upserted++
    }

    return NextResponse.json({
      ok: true,
      total_traders: byWallet.size,
      top_processed: top.length,
      upserted,
    })
  } catch (err) {
    console.error('[cron sync-external-traders]', err)
    // Non rompere il deploy se Polymarket Data API è down
    return NextResponse.json({
      ok: true,
      processed: 0,
      message: err instanceof Error ? err.message : 'fetch failed',
    })
  }
}
