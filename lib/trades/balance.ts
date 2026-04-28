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

export interface RealBalanceSnapshot {
  usdcBalance: number
  realVolumeTotal: number
}

/**
 * Recupera il saldo REAL (pUSD on-chain è la fonte di verità, ma teniamo
 * un cached `usdc_balance` per UI). Se balances non esiste, inizializza a 0.
 */
export async function getOrInitRealBalance(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<RealBalanceSnapshot | { error: string }> {
  const { data: row } = await supabase
    .from('balances')
    .select('usdc_balance, real_volume_total')
    .eq('user_id', userId)
    .maybeSingle()
  if (row) {
    return {
      usdcBalance: Number(row.usdc_balance ?? 0),
      realVolumeTotal: Number(row.real_volume_total ?? 0),
    }
  }
  const { error: insErr } = await supabase.from('balances').insert({ user_id: userId })
  if (insErr) return { error: insErr.message }
  return { usdcBalance: 0, realVolumeTotal: 0 }
}

/**
 * Aggiorna cached `balances.usdc_balance` (decremento dell'amount tradato)
 * e cumulato `real_volume_total`. La fonte di verità è on-chain pUSD —
 * questo cache si auto-corregge al prossimo BalanceHydrator refresh.
 */
export async function applyRealBalanceDelta(
  supabase: SupabaseClient<Database>,
  userId: string,
  newUsdcBalance: number,
  newRealVolumeTotal: number
): Promise<string | null> {
  const { error } = await supabase
    .from('balances')
    .update({
      usdc_balance: newUsdcBalance,
      real_volume_total: newRealVolumeTotal,
      usdc_last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
  return error?.message ?? null
}
