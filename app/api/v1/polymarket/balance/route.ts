import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOnboardStatus } from '@/lib/polymarket/auth'
import { getPusdBalance, formatPusdBalance } from '@/lib/polymarket/pusd'

/**
 * GET /api/v1/polymarket/balance
 * Restituisce balance pUSD on-chain del funder address dell'utente.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const status = await getOnboardStatus(createAdminClient(), auth.userId)
  if ('error' in status) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Errore lettura status' } },
      { status: 500 }
    )
  }
  if (!status.onboarded || !status.funderAddress) {
    return NextResponse.json(
      {
        error: { code: 'NOT_ONBOARDED', message: 'Utente non ha completato onboarding Polymarket' },
      },
      { status: 412 }
    )
  }

  try {
    const raw = await getPusdBalance(status.funderAddress)
    return NextResponse.json({
      address: status.funderAddress,
      raw: raw.toString(),
      pusd: formatPusdBalance(raw),
    })
  } catch (err) {
    console.error('[balance GET]', err)
    return NextResponse.json(
      {
        error: {
          code: 'RPC_ERROR',
          message: err instanceof Error ? err.message : 'Errore lettura balance',
        },
      },
      { status: 502 }
    )
  }
}
