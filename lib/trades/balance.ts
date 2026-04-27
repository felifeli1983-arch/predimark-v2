import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

export const DEFAULT_DEMO_BALANCE = 10000

export interface BalanceSnapshot {
  demoBalance: number
  demoVolumeTotal: number
}

/**
 * Recupera il saldo demo dell'utente. Se la riga `balances` non esiste,
 * la inizializza con i default schema (demo $10k).
 *
 * Ritorna `null` se l'inizializzazione fallisce.
 */
export async function getOrInitDemoBalance(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<BalanceSnapshot | { error: string }> {
  const { data: row } = await supabase
    .from('balances')
    .select('demo_balance, demo_volume_total')
    .eq('user_id', userId)
    .maybeSingle()

  if (row) {
    return {
      demoBalance: Number(row.demo_balance ?? DEFAULT_DEMO_BALANCE),
      demoVolumeTotal: Number(row.demo_volume_total ?? 0),
    }
  }

  const { error: insErr } = await supabase.from('balances').insert({ user_id: userId })
  if (insErr) {
    return { error: insErr.message }
  }
  return { demoBalance: DEFAULT_DEMO_BALANCE, demoVolumeTotal: 0 }
}

/**
 * Aggiorna `balances.demo_balance` e cumulato `demo_volume_total`.
 * Ritorna `null` se OK, altrimenti messaggio di errore.
 */
export async function applyDemoBalanceDelta(
  supabase: SupabaseClient<Database>,
  userId: string,
  newDemoBalance: number,
  newDemoVolumeTotal: number
): Promise<string | null> {
  const { error } = await supabase
    .from('balances')
    .update({
      demo_balance: newDemoBalance,
      demo_volume_total: newDemoVolumeTotal,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
  return error?.message ?? null
}
