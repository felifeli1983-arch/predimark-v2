import { NextRequest, NextResponse } from 'next/server'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import type { TablesInsert } from '@/lib/supabase/database.types'

interface SubmitBody {
  polymarketMarketId: string
  polymarketEventId: string
  slug: string
  title: string
  cardKind: string
  category: string
  side: string
  amountUsdc: number
  pricePerShare: number
  isDemo: boolean
}

export interface TradeSubmitResponse {
  tradeId: string
  positionId: string
  sharesAcquired: number
  newDemoBalance: number | null
  newRealBalance: number | null
}

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

/**
 * POST /api/v1/trades/submit
 *
 * Single-market trade. MA4.3: solo DEMO mode.
 * Real mode (Polymarket CLOB) arriva in MA4.4 via Edge Function `submit-trade`.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  let body: SubmitBody
  try {
    body = (await request.json()) as SubmitBody
  } catch {
    return ERR('INVALID_BODY', 'JSON body non valido', 400)
  }

  // --- Validation ---
  if (
    !body.polymarketMarketId ||
    !body.polymarketEventId ||
    !body.slug ||
    !body.title ||
    !body.cardKind ||
    !body.category ||
    !body.side
  ) {
    return ERR('MISSING_FIELD', 'Campi richiesti mancanti', 400)
  }
  if (!Number.isFinite(body.amountUsdc) || body.amountUsdc <= 0) {
    return ERR('INVALID_AMOUNT', 'amountUsdc deve essere > 0', 400)
  }
  if (!Number.isFinite(body.pricePerShare) || body.pricePerShare <= 0 || body.pricePerShare >= 1) {
    return ERR('INVALID_PRICE', 'pricePerShare deve essere strettamente tra 0 e 1', 400)
  }
  // MA4.3 supporta SOLO demo
  if (!body.isDemo) {
    return ERR('REAL_NOT_SUPPORTED', 'Real mode arriverà in MA4.4 (Polymarket CLOB)', 501)
  }

  const supabase = createAdminClient()

  // --- 1. Upsert markets (resolve a markets.id interno) ---
  const marketUpsert: TablesInsert<'markets'> = {
    polymarket_market_id: body.polymarketMarketId,
    polymarket_event_id: body.polymarketEventId,
    slug: body.slug,
    title: body.title,
    card_kind: body.cardKind,
    category: body.category,
    current_yes_price: body.pricePerShare,
    last_synced_at: new Date().toISOString(),
  }

  const { data: market, error: marketErr } = await supabase
    .from('markets')
    .upsert(marketUpsert, { onConflict: 'polymarket_market_id' })
    .select('id')
    .single()

  if (marketErr || !market) {
    console.error('[trades/submit] markets upsert', marketErr)
    return ERR('MARKET_UPSERT_FAILED', 'Errore sync mercato', 500)
  }

  // --- 2. Verifica/crea balances row e check saldo ---
  const { data: balanceRow } = await supabase
    .from('balances')
    .select('demo_balance, demo_volume_total')
    .eq('user_id', auth.userId)
    .maybeSingle()

  let currentDemoBalance = balanceRow?.demo_balance ?? 10000 // default schema
  if (!balanceRow) {
    // Inizializza row con saldo default
    const { error: insBalErr } = await supabase.from('balances').insert({ user_id: auth.userId })
    if (insBalErr) {
      console.error('[trades/submit] balances init', insBalErr)
      return ERR('BALANCE_INIT_FAILED', 'Errore inizializzazione saldo', 500)
    }
    currentDemoBalance = 10000
  }

  if (Number(currentDemoBalance) < body.amountUsdc) {
    return ERR('INSUFFICIENT_BALANCE', 'Saldo demo insufficiente', 403)
  }

  // --- 3. Calcola shares ---
  const shares = body.amountUsdc / body.pricePerShare

  // --- 4. Cerca posizione aperta esistente per stesso market+side ---
  const { data: existingPos } = await supabase
    .from('positions')
    .select('id, shares, total_cost, avg_price')
    .eq('user_id', auth.userId)
    .eq('market_id', market.id)
    .eq('side', body.side)
    .eq('is_demo', true)
    .eq('is_open', true)
    .maybeSingle()

  let positionId: string

  if (existingPos) {
    // Aggiorna posizione: avg_price ricalcolato, shares e total_cost incrementati
    const newShares = Number(existingPos.shares) + shares
    const newTotalCost = Number(existingPos.total_cost) + body.amountUsdc
    const newAvgPrice = newTotalCost / newShares

    const { error: updPosErr } = await supabase
      .from('positions')
      .update({
        shares: newShares,
        total_cost: newTotalCost,
        avg_price: newAvgPrice,
        current_price: body.pricePerShare,
        current_value: newShares * body.pricePerShare,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingPos.id)
    if (updPosErr) {
      console.error('[trades/submit] position update', updPosErr)
      return ERR('POSITION_UPDATE_FAILED', 'Errore aggiornamento posizione', 500)
    }
    positionId = existingPos.id
  } else {
    const { data: newPos, error: insPosErr } = await supabase
      .from('positions')
      .insert({
        user_id: auth.userId,
        market_id: market.id,
        side: body.side,
        shares,
        avg_price: body.pricePerShare,
        total_cost: body.amountUsdc,
        current_price: body.pricePerShare,
        current_value: body.amountUsdc, // = shares * price
        is_demo: true,
        is_open: true,
      })
      .select('id')
      .single()
    if (insPosErr || !newPos) {
      console.error('[trades/submit] position insert', insPosErr)
      return ERR('POSITION_INSERT_FAILED', 'Errore creazione posizione', 500)
    }
    positionId = newPos.id
  }

  // --- 5. Insert trades row ---
  const { data: trade, error: insTradeErr } = await supabase
    .from('trades')
    .insert({
      user_id: auth.userId,
      market_id: market.id,
      position_id: positionId,
      trade_type: 'open',
      side: body.side,
      shares,
      price: body.pricePerShare,
      total_amount: body.amountUsdc,
      source: 'manual',
      is_demo: true,
    })
    .select('id')
    .single()

  if (insTradeErr || !trade) {
    console.error('[trades/submit] trade insert', insTradeErr)
    return ERR('TRADE_INSERT_FAILED', 'Errore registrazione trade', 500)
  }

  // --- 6. Decrement balances.demo_balance + cumulato volume ---
  const newDemoBalance = Number(currentDemoBalance) - body.amountUsdc
  const newDemoVolumeTotal = Number(balanceRow?.demo_volume_total ?? 0) + body.amountUsdc

  const { error: updBalErr } = await supabase
    .from('balances')
    .update({
      demo_balance: newDemoBalance,
      demo_volume_total: newDemoVolumeTotal,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', auth.userId)

  if (updBalErr) {
    console.error('[trades/submit] balance update', updBalErr)
    // Trade e position già inseriti — flag come anomalia, ma non rolling back
    // (rollback richiederebbe transaction PG, troppo complesso per stub MVP).
    // Il prossimo refresh balance corregge l'incongruenza con la somma dei trades.
    return ERR('BALANCE_UPDATE_FAILED', 'Trade registrato ma saldo non aggiornato — riprova', 500)
  }

  const response: TradeSubmitResponse = {
    tradeId: trade.id,
    positionId,
    sharesAcquired: shares,
    newDemoBalance,
    newRealBalance: null,
  }

  return NextResponse.json(response, { status: 201 })
}
