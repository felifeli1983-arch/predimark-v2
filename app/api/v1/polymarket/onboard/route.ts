import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { saveUserApiCreds, getOnboardStatus } from '@/lib/polymarket/auth'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

interface OnboardBody {
  apiKey?: string
  secret?: string
  passphrase?: string
  funderAddress?: string
}

/**
 * GET /api/v1/polymarket/onboard
 * Restituisce lo stato onboarding dell'utente corrente (no creds esposte).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  const status = await getOnboardStatus(createAdminClient(), auth.userId)
  if ('error' in status) {
    console.error('[onboard GET]', status.error)
    return ERR('INTERNAL_ERROR', 'Errore lettura status onboarding', 500)
  }
  return NextResponse.json(status)
}

/**
 * POST /api/v1/polymarket/onboard
 * Body: { apiKey, secret, passphrase, funderAddress }
 *
 * MA4.4 Phase B — il client ottiene le creds via SDK V2 `createOrDeriveApiKey()`
 * usando il signer Privy embedded, poi le manda qui. Server cifra e salva.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  let body: OnboardBody
  try {
    body = (await request.json()) as OnboardBody
  } catch {
    return ERR('INVALID_BODY', 'JSON body non valido', 400)
  }

  const { apiKey, secret, passphrase, funderAddress } = body
  if (!apiKey || !secret || !passphrase || !funderAddress) {
    return ERR('MISSING_FIELD', 'apiKey, secret, passphrase, funderAddress richiesti', 400)
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(funderAddress)) {
    return ERR('INVALID_ADDRESS', 'funderAddress non è un EVM address valido', 400)
  }

  const result = await saveUserApiCreds(
    createAdminClient(),
    auth.userId,
    { apiKey, secret, passphrase },
    funderAddress
  )
  if ('error' in result) {
    console.error('[onboard POST]', result.error)
    return ERR('INTERNAL_ERROR', 'Errore salvataggio credenziali', 500)
  }
  return NextResponse.json({ ok: true }, { status: 201 })
}
