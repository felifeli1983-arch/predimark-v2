'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { TablesInsert } from '@/lib/supabase/database.types'

export interface SyncUserInput {
  privyDid: string
  email?: string
  emailVerified?: boolean
  walletAddress?: string
}

export async function syncUserToSupabase(data: SyncUserInput): Promise<{ error: string | null }> {
  try {
    const supabase = createAdminClient()

    const payload: TablesInsert<'users'> = {
      privy_did: data.privyDid,
      wallet_address: data.walletAddress ?? null,
      email: data.email ?? null,
      email_verified: data.emailVerified ?? false,
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('users').upsert(payload, { onConflict: 'privy_did' })

    if (error) return { error: error.message }
    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Errore sconosciuto' }
  }
}
