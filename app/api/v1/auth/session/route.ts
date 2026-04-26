import { NextRequest, NextResponse } from 'next/server'
import { verifyPrivyToken, getPrivyUser } from '@/lib/privy/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { resolveGeoBlockStatus } from '@/lib/geo/resolveGeoBlock'
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types'

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Estrai JWT dall'header Authorization
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: { code: 'AUTH_MISSING', message: 'Authorization header mancante' } },
      { status: 401 }
    )
  }
  const token = authHeader.slice(7)

  // 2. Verifica JWT Privy
  let privyDid: string
  try {
    const verified = await verifyPrivyToken(token)
    privyDid = verified.privyDid
  } catch {
    return NextResponse.json(
      { error: { code: 'AUTH_INVALID', message: 'JWT Privy non valido o scaduto' } },
      { status: 401 }
    )
  }

  // 3. Recupera dati utente da Privy
  const privyUser = await getPrivyUser(privyDid)

  // 4. Risolvi geo_block_status
  const { countryCode, status: geoStatus } = await resolveGeoBlockStatus(request)

  if (geoStatus === 'blocked') {
    return NextResponse.json(
      {
        error: {
          code: 'GEO_BLOCKED',
          message: 'Accesso non consentito dalla tua posizione geografica',
          details: { country_code: countryCode },
        },
      },
      { status: 403 }
    )
  }

  // 5. Upsert utente in Supabase
  const supabase = createAdminClient()

  const upsertPayload: TablesInsert<'users'> = {
    privy_did: privyDid,
    email: privyUser.email ?? null,
    email_verified: Boolean(privyUser.email),
    wallet_address: privyUser.walletAddress ?? null,
    country_code: countryCode,
    geo_block_status: geoStatus,
    last_login_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data: user, error: upsertError } = await supabase
    .from('users')
    .upsert(upsertPayload, { onConflict: 'privy_did' })
    .select(
      'id, wallet_address, username, email, country_code, geo_block_status, language, onboarding_completed'
    )
    .single()

  if (upsertError || !user) {
    console.error('[auth/session] Supabase upsert error:', upsertError)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Errore salvataggio utente' } },
      { status: 500 }
    )
  }

  // 6. Se geo_block_status del record esistente differisce da quello calcolato ora
  //    (es. utente arriva da un nuovo paese), aggiorna esplicitamente
  if (user.geo_block_status !== geoStatus) {
    const update: TablesUpdate<'users'> = {
      country_code: countryCode,
      geo_block_status: geoStatus,
      updated_at: new Date().toISOString(),
    }
    await supabase.from('users').update(update).eq('privy_did', privyDid)
    user.geo_block_status = geoStatus
    user.country_code = countryCode
  }

  // 7. Response formato Doc 7
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  return NextResponse.json({
    user: {
      id: user.id,
      wallet_address: user.wallet_address,
      username: user.username,
      email: user.email,
      country_code: user.country_code,
      geo_block_status: user.geo_block_status,
      language: user.language,
      onboarding_completed: user.onboarding_completed,
    },
    session: {
      expires_at: expiresAt,
    },
  })
}
