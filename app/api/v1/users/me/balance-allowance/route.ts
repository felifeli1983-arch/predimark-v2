import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { loadUserApiCreds } from '@/lib/polymarket/auth'
import { getBalanceAllowance } from '@/lib/polymarket/order-post'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * GET /api/v1/users/me/balance-allowance?asset_type=COLLATERAL
 * GET /api/v1/users/me/balance-allowance?asset_type=CONDITIONAL&token_id=...
 *
 * Doc L2 Methods → getBalanceAllowance. Used dal trade widget pre-submit
 * per:
 *  - Mostrare "Disponibile: $X" (USDC)
 *  - Warn se allowance < balance (richiede approve on-chain prima)
 *  - Block submit se balance insufficiente
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const url = new URL(request.url)
  const assetType = url.searchParams.get('asset_type')
  const tokenId = url.searchParams.get('token_id') ?? undefined

  if (assetType !== 'COLLATERAL' && assetType !== 'CONDITIONAL') {
    return ERR('VALIDATION', 'asset_type deve essere COLLATERAL o CONDITIONAL', 400)
  }
  if (assetType === 'CONDITIONAL' && !tokenId) {
    return ERR('VALIDATION', 'token_id required quando asset_type=CONDITIONAL', 400)
  }

  const supabase = createAdminClient()
  const creds = await loadUserApiCreds(supabase, auth.userId)
  if (!creds) return ERR('NOT_ONBOARDED', 'Utente non collegato a Polymarket', 400)

  const result = await getBalanceAllowance(
    { key: creds.apiKey, secret: creds.secret, passphrase: creds.passphrase },
    assetType,
    tokenId
  )
  if (!result) return ERR('CLOB_ERROR', 'Errore fetch balance/allowance', 502)
  return NextResponse.json(result)
}
