import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeCreatorScore, computeCreatorTier } from '@/lib/creators/score'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/cron/creator-scores
 *
 * Sprint 6.4.1 — Score Predimark + Tier assignment.
 * Weekly (lunedì 05:00 UTC, vercel.json).
 *
 * Per ogni Creator verified, calcola score 0-1000 + assegna tier (legend/pro/rising/rookie/newcomer).
 * Update `creators.score` e `creators.tier`.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return ERR('AUTH_INVALID', 'Cron secret invalid', 401)
  }

  const supabase = createAdminClient()

  try {
    const { data: creators, error } = await supabase
      .from('creators')
      .select('user_id, followers_count, total_earnings, copiers_active')
      .eq('is_verified', true)
      .eq('is_suspended', false)

    if (error) {
      console.error('[cron creator-scores]', error)
      return ERR('INTERNAL_ERROR', 'Errore lettura creators', 500)
    }

    if (!creators || creators.length === 0) {
      return NextResponse.json({ ok: true, processed: 0 })
    }

    let updated = 0
    for (const c of creators) {
      const metrics = {
        followers_count: Number(c.followers_count ?? 0),
        total_earnings: Number(c.total_earnings ?? 0),
        win_rate: 0, // win_rate non in schema creators (vedi external_traders); default 0 per MVP
      }
      const score = computeCreatorScore(metrics)
      const tier = computeCreatorTier(score)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updErr } = await (supabase.from('creators') as any)
        .update({ score, tier, updated_at: new Date().toISOString() })
        .eq('user_id', c.user_id)

      if (!updErr) updated++
    }

    return NextResponse.json({
      ok: true,
      total_creators: creators.length,
      updated,
    })
  } catch (err) {
    console.error('[cron creator-scores]', err)
    return ERR('INTERNAL_ERROR', 'Errore generale cron', 500)
  }
}
