import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, TablesInsert } from '@/lib/supabase/database.types'

export interface MarketUpsertPayload {
  polymarketMarketId: string
  polymarketEventId: string
  slug: string
  title: string
  cardKind: string
  category: string
  image?: string
  currentYesPrice?: number
  /** [yesTokenId, noTokenId] — Polymarket conditional token IDs. */
  clobTokenIds?: [string, string] | null
}

/**
 * Risolve (o crea) il record `markets` interno per un Polymarket market.
 * Usato da watchlist e trades — necessità admin client per bypass RLS.
 *
 * Ritorna l'UUID interno del market, o `null` se l'upsert fallisce.
 */
export async function resolveOrUpsertMarket(
  supabase: SupabaseClient<Database>,
  payload: MarketUpsertPayload
): Promise<{ id: string } | { error: string }> {
  const upsert: TablesInsert<'markets'> = {
    polymarket_market_id: payload.polymarketMarketId,
    polymarket_event_id: payload.polymarketEventId,
    slug: payload.slug,
    title: payload.title,
    card_kind: payload.cardKind,
    category: payload.category,
    image_url: payload.image ?? null,
    current_yes_price: payload.currentYesPrice ?? null,
    clob_token_ids: payload.clobTokenIds ?? null,
    last_synced_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('markets')
    .upsert(upsert, { onConflict: 'polymarket_market_id' })
    .select('id')
    .single()

  if (error || !data) {
    return { error: error?.message ?? 'upsert failed' }
  }
  return { id: data.id }
}

/** Lookup-only — utile per DELETE watchlist (non vogliamo creare row se non esiste già). */
export async function findMarketByPolymarketId(
  supabase: SupabaseClient<Database>,
  polymarketMarketId: string
): Promise<{ id: string } | null> {
  const { data } = await supabase
    .from('markets')
    .select('id')
    .eq('polymarket_market_id', polymarketMarketId)
    .maybeSingle()
  return data ?? null
}
