import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, TablesInsert } from '@/lib/supabase/database.types'
import type { WatchlistItem } from '@/app/api/v1/watchlist/route'

/** Lista watchlist user con join markets — query ottimizzata. */
export async function listWatchlist(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<WatchlistItem[] | { error: string }> {
  const { data, error } = await supabase
    .from('watchlist')
    .select(
      `
        id,
        notify_price_change_pct,
        notify_signal,
        notify_resolution,
        added_at,
        markets (
          id,
          polymarket_market_id,
          polymarket_event_id,
          slug,
          title,
          image_url,
          current_yes_price
        )
      `
    )
    .eq('user_id', userId)
    .order('added_at', { ascending: false })

  if (error) return { error: error.message }

  return (data ?? []).map((row) => ({
    id: row.id,
    polymarketMarketId: row.markets?.polymarket_market_id ?? '',
    polymarketEventId: row.markets?.polymarket_event_id ?? null,
    slug: row.markets?.slug ?? null,
    title: row.markets?.title ?? '',
    image: row.markets?.image_url ?? null,
    currentYesPrice: row.markets?.current_yes_price ?? null,
    notifyPriceChangePct: row.notify_price_change_pct,
    notifySignal: row.notify_signal ?? true,
    notifyResolution: row.notify_resolution ?? true,
    addedAt: row.added_at ?? new Date().toISOString(),
  }))
}

interface AddToWatchlistInput {
  userId: string
  marketId: string
  notifyPriceChangePct?: number
  notifySignal?: boolean
  notifyResolution?: boolean
}

/** Insert idempotent (UNIQUE user_id+market_id). Ritorna l'id watchlist row. */
export async function addToWatchlist(
  supabase: SupabaseClient<Database>,
  input: AddToWatchlistInput
): Promise<{ id: string } | { error: string }> {
  const insert: TablesInsert<'watchlist'> = {
    user_id: input.userId,
    market_id: input.marketId,
    notify_price_change_pct: input.notifyPriceChangePct ?? null,
    notify_signal: input.notifySignal ?? true,
    notify_resolution: input.notifyResolution ?? true,
  }
  const { data, error } = await supabase
    .from('watchlist')
    .upsert(insert, { onConflict: 'user_id,market_id' })
    .select('id')
    .single()
  if (error || !data) return { error: error?.message ?? 'insert failed' }
  return { id: data.id }
}

/** Delete scoped per user_id (idempotent: 0 rows affected è OK). */
export async function removeFromWatchlist(
  supabase: SupabaseClient<Database>,
  userId: string,
  marketId: string
): Promise<{ error: string } | null> {
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', userId)
    .eq('market_id', marketId)
  return error ? { error: error.message } : null
}
