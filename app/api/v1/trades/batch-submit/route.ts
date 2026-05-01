import { NextRequest, NextResponse } from 'next/server'
import type { SignedOrder } from '@polymarket/clob-client-v2'
import { requireUserId } from '@/lib/api/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { loadUserApiCreds } from '@/lib/polymarket/auth'
import { postSignedOrdersBatch } from '@/lib/polymarket/order-post'
import { resolveOrUpsertMarket } from '@/lib/markets/upsert'
import { upsertOpenPosition } from '@/lib/trades/position'
import { insertOpenTrade } from '@/lib/trades/insert'
import { getOrInitRealBalance, applyRealBalanceDelta } from '@/lib/trades/balance'
import { evaluateGeoStatus, extractGeoFromHeaders } from '@/lib/polymarket/geoblock'

const ERR = (code: string, message: string, status: number) =>
  NextResponse.json({ error: { code, message } }, { status })

interface BatchLeg {
  legId: string
  tokenId: string
  signedOrder: unknown
  meta: {
    marketId: string
    eventId: string
    slug: string
    title: string
    cardKind: string
    category: string
    side: string
    pricePerShare: number
    amountUsdc: number
    outcomeLabel: string
    clobTokenIds: [string, string] | null
    conditionId: string
  }
}

const MAX_LEGS = 10

/**
 * POST /api/v1/trades/batch-submit
 * Body: { legs: BatchLeg[] }
 *
 * Bet Slip multi-leg submit. Doc L2 Methods → postOrders SDK batch.
 * Limit 10 leg (margine vs SDK 15).
 *
 * Flow:
 *  1. Auth + geo check (REAL only)
 *  2. Load creds L2 utente
 *  3. postOrders SDK in 1 call
 *  4. Per ogni risposta CLOB ok=true: insert position + trade + balance delta
 *  5. Ritorna array per-leg con ok/orderId/error
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = await requireUserId(request)
  if ('error' in auth) return auth.error

  let body: { legs?: BatchLeg[] }
  try {
    body = (await request.json()) as { legs?: BatchLeg[] }
  } catch {
    return ERR('INVALID_BODY', 'JSON body non valido', 400)
  }
  const legs = body.legs ?? []
  if (!Array.isArray(legs) || legs.length === 0) {
    return ERR('VALIDATION', 'legs[] richiesto e non vuoto', 400)
  }
  if (legs.length > MAX_LEGS) {
    return ERR('VALIDATION', `Max ${MAX_LEGS} leg per batch`, 400)
  }

  // Geo-block REAL trading (compliance Polymarket builder)
  const geo = extractGeoFromHeaders(request.headers)
  const geoStatus = evaluateGeoStatus(geo.country, geo.region)
  if (!geoStatus.allowed) {
    return ERR(
      'GEO_BLOCKED',
      `Trading REAL non disponibile dalla tua regione (${geoStatus.country})`,
      451
    )
  }

  const supabase = createAdminClient()
  const creds = await loadUserApiCreds(supabase, auth.userId)
  if (!creds) return ERR('NOT_ONBOARDED', 'Utente non collegato a Polymarket', 412)

  // 1 call SDK postOrders batch
  let batchResults
  try {
    batchResults = await postSignedOrdersBatch(
      legs.map((l) => ({ signedOrder: l.signedOrder as SignedOrder })),
      { key: creds.apiKey, secret: creds.secret, passphrase: creds.passphrase }
    )
  } catch (err) {
    console.error('[batch-submit] CLOB postOrders', err)
    return ERR('CLOB_ERROR', err instanceof Error ? err.message : 'Errore postOrders batch', 502)
  }

  // Balance init una volta sola
  const balanceInit = await getOrInitRealBalance(supabase, auth.userId)
  if ('error' in balanceInit) {
    console.error('[batch-submit] balance init', balanceInit.error)
    return ERR('BALANCE_INIT_FAILED', 'Errore lettura balance', 500)
  }

  // Per ogni leg: market upsert + position + trade + balance delta
  const results: Array<{
    legId: string
    ok: boolean
    orderId?: string
    error?: string
  }> = []

  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i]!
    const r = batchResults[i]
    if (!r?.ok || !r.orderID) {
      results.push({ legId: leg.legId, ok: false, error: r?.errorMsg ?? 'Ordine rifiutato' })
      continue
    }

    try {
      const marketRes = await resolveOrUpsertMarket(supabase, {
        polymarketMarketId: leg.meta.marketId,
        polymarketEventId: leg.meta.eventId,
        slug: leg.meta.slug,
        title: leg.meta.title,
        cardKind: leg.meta.cardKind,
        category: leg.meta.category,
        currentYesPrice: leg.meta.pricePerShare,
        clobTokenIds: leg.meta.clobTokenIds ?? undefined,
      })
      if ('error' in marketRes) {
        results.push({ legId: leg.legId, ok: false, error: 'Errore sync mercato' })
        continue
      }

      const shares = leg.meta.amountUsdc / leg.meta.pricePerShare
      const posRes = await upsertOpenPosition(supabase, {
        userId: auth.userId,
        marketId: marketRes.id,
        side: leg.meta.side,
        shares,
        pricePerShare: leg.meta.pricePerShare,
        amountUsdc: leg.meta.amountUsdc,
        isDemo: false,
      })
      if ('error' in posRes) {
        results.push({ legId: leg.legId, ok: false, error: 'Errore upsert posizione' })
        continue
      }

      const tradeRes = await insertOpenTrade(supabase, {
        userId: auth.userId,
        marketId: marketRes.id,
        positionId: posRes.positionId,
        side: leg.meta.side,
        shares,
        pricePerShare: leg.meta.pricePerShare,
        amountUsdc: leg.meta.amountUsdc,
        isDemo: false,
        polymarketOrderId: r.orderID,
      })
      if ('error' in tradeRes) {
        results.push({ legId: leg.legId, ok: false, error: 'Errore insert trade' })
        continue
      }

      // applyRealBalanceDelta è SET assoluto — passa nuovo balance e
      // nuovo volume cumulato.
      await applyRealBalanceDelta(
        supabase,
        auth.userId,
        balanceInit.usdcBalance - leg.meta.amountUsdc,
        balanceInit.realVolumeTotal + leg.meta.amountUsdc
      )
      // Aggiorna il snapshot in memoria per il prossimo leg
      balanceInit.usdcBalance -= leg.meta.amountUsdc
      balanceInit.realVolumeTotal += leg.meta.amountUsdc

      results.push({ legId: leg.legId, ok: true, orderId: r.orderID })
    } catch (err) {
      console.error('[batch-submit] post-process leg', leg.legId, err)
      results.push({
        legId: leg.legId,
        ok: false,
        error: err instanceof Error ? err.message : 'Errore post-processing',
      })
    }
  }

  return NextResponse.json({ results })
}
