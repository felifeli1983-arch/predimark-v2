import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'

const DEFAULT_DEMO_BALANCE = 10000

/**
 * GET /api/v1/balances
 * Saldo USDC real + demo dell'utente. Inizializza riga con default
 * (demo $10k) al primo accesso.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const supabase = createAdminClient()

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

  return NextResponse.json({
    usdcBalance: Number(row.usdc_balance ?? 0),
    usdcLocked: Number(row.usdc_locked ?? 0),
    demoBalance: Number(row.demo_balance ?? DEFAULT_DEMO_BALANCE),
    demoLocked: Number(row.demo_locked ?? 0),
  })
}
