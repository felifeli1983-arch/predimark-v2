import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { encrypt, decrypt } from '@/lib/crypto/encrypt'

export interface PolymarketApiCreds {
  apiKey: string
  secret: string
  passphrase: string
}

export interface UserOnboardStatus {
  onboarded: boolean
  funderAddress: string | null
  onboardedAt: string | null
}

/**
 * Cifra e salva la tripletta L2 API Polymarket di un utente.
 * Idempotente: se l'utente è già onboardato, sovrascrive.
 */
export async function saveUserApiCreds(
  supabase: SupabaseClient<Database>,
  userId: string,
  creds: PolymarketApiCreds,
  funderAddress: string
): Promise<{ ok: true } | { error: string }> {
  const { error } = await supabase
    .from('users')
    .update({
      polymarket_api_key: encrypt(creds.apiKey),
      polymarket_api_secret: encrypt(creds.secret),
      polymarket_api_passphrase: encrypt(creds.passphrase),
      polymarket_funder_address: funderAddress.toLowerCase(),
      polymarket_onboarded_at: new Date().toISOString(),
    })
    .eq('id', userId)
  if (error) return { error: error.message }
  return { ok: true }
}

/**
 * Decifra e ritorna le L2 API creds di un utente onboardato. Ritorna null se
 * l'utente non ha ancora completato l'onboarding.
 */
export async function loadUserApiCreds(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<(PolymarketApiCreds & { funderAddress: string }) | null> {
  const { data } = await supabase
    .from('users')
    .select(
      'polymarket_api_key, polymarket_api_secret, polymarket_api_passphrase, polymarket_funder_address'
    )
    .eq('id', userId)
    .maybeSingle()
  if (
    !data?.polymarket_api_key ||
    !data.polymarket_api_secret ||
    !data.polymarket_api_passphrase ||
    !data.polymarket_funder_address
  ) {
    return null
  }
  return {
    apiKey: decrypt(data.polymarket_api_key),
    secret: decrypt(data.polymarket_api_secret),
    passphrase: decrypt(data.polymarket_api_passphrase),
    funderAddress: data.polymarket_funder_address,
  }
}

/** Stato onboarding senza esporre creds. */
export async function getOnboardStatus(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserOnboardStatus | { error: string }> {
  const { data, error } = await supabase
    .from('users')
    .select('polymarket_onboarded_at, polymarket_funder_address')
    .eq('id', userId)
    .maybeSingle()
  if (error) return { error: error.message }
  return {
    onboarded: Boolean(data?.polymarket_onboarded_at),
    funderAddress: data?.polymarket_funder_address ?? null,
    onboardedAt: data?.polymarket_onboarded_at ?? null,
  }
}
