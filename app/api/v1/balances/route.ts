import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const DEFAULT_DEMO_BALANCE = 10000

/**
 * GET /api/v1/balances
 * Saldo USDC real + demo + Portfolio (valore posizioni aperte real + demo).
 * Inizializza riga balance con default (demo $10k) al primo accesso.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const supabase = createAdminClient()

  // Saldo cash
  let { data: row } = await supabase
    .from('balances')
    .select('usdc_balance, usdc_locked, demo_balance, demo_locked')
    .eq('user_id', auth.userId)
    .maybeSingle()

  if (!row) {
    const { error: insErr } = await supabase.from('balances').insert({ user_id: auth.userId })
    if (insErr) {
      console.error('[balances GET] init', insErr)
      return NextResponse.json(
        { error: { code: 'INIT_FAILED', message: 'Errore inizializzazione saldo' } },
        { status: 500 }
      )
    }
    row = {
      usdc_balance: 0,
      usdc_locked: 0,
      demo_balance: DEFAULT_DEMO_BALANCE,
      demo_locked: 0,
    }
  }

  // Portfolio = somma current_value posizioni aperte, separata per real/demo
  const { data: positions } = await supabase
    .from('positions')
    .select('current_value, is_demo')
    .eq('user_id', auth.userId)
    .eq('is_open', true)

  let realPortfolioValue = 0
  let demoPortfolioValue = 0
  for (const p of positions ?? []) {
    const v = Number(p.current_value ?? 0)
    if (p.is_demo) demoPortfolioValue += v
    else realPortfolioValue += v
  }

  return NextResponse.json({
    usdcBalance: Number(row.usdc_balance ?? 0),
    usdcLocked: Number(row.usdc_locked ?? 0),
    demoBalance: Number(row.demo_balance ?? DEFAULT_DEMO_BALANCE),
    demoLocked: Number(row.demo_locked ?? 0),
    realPortfolioValue,
    demoPortfolioValue,
  })
}
