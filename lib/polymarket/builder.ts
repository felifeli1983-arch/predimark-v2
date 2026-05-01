/**
 * Builder analytics — trades attribuiti al nostro builder code Auktora.
 *
 * Doc Polymarket "Builder Methods": Track orders and trades attributed
 * to your builder code via getBuilderTrades(BuilderTradesPaginatedResponse).
 *
 * SDK method: `getBuilderTrades({ builder_code, market?, asset_id?,
 * before?, after? })` ritorna paginato cursor-based con next_cursor.
 *
 * Auth: richiede L2 creds del wallet che owns il builder code (server-side,
 * env vars POLYMARKET_BUILDER_API_KEY/SECRET/PASSPHRASE). MAI esporre
 * client-side.
 */

import { ClobClient, Chain, type ApiKeyCreds } from '@polymarket/clob-client-v2'
import { CLOB_URL, BUILDER_CODE } from './clob'

export interface BuilderTradeRow {
  id: string
  /** Type of the trade (Doc Builder Methods → BuilderTrade.tradeType). */
  tradeType: string
  /** Hash of the taker order (Doc → takerOrderHash). */
  takerOrderHash: string
  market: string
  assetId: string
  side: 'BUY' | 'SELL'
  outcome: string
  outcomeIndex: number
  size: number
  /** USDC value of trade (size × price). */
  sizeUsdc: number
  price: number
  /** Trader address (taker). */
  owner: string
  /** Maker address. */
  maker: string
  status: string
  fee: number
  /** Fee in USDC. */
  feeUsdc: number
  transactionHash: string
  matchTime: string
  /** Bucket index per trade reconciliation (split tx). */
  bucketIndex: number
  /**
   * Builder code attribution (bytes32) — Doc Order Attribution.
   * Sanity check: deve coincidere con BUILDER_CODE configurato.
   */
  builder: string
  /** Error message se trade ha encountered issue, altrimenti null. */
  errMsg: string | null
  /** Timestamp creation record (può essere null). */
  createdAt: string | null
  /** Timestamp ultimo update record (può essere null). */
  updatedAt: string | null
}

export interface BuilderTradesPaginatedResponse {
  trades: BuilderTradeRow[]
  /** Cursor opaco per la prossima pagina, vuoto se ultima. */
  nextCursor: string
  /** Massimo trade per pagina (server-side limit). */
  limit: number
  /** Trade count in QUESTA pagina (non total). */
  count: number
}

export interface BuilderStats {
  /** Numero totale trade attribuiti. */
  totalCount: number
  /** Volume totale USDC facilitato. */
  totalVolumeUsdc: number
  /** Fee totali raccolte (se builder fee enabled). */
  totalFeeUsdc: number
  /** Numero unique trader. */
  uniqueTraders: number
  /** Numero unique market. */
  uniqueMarkets: number
}

function builderCreds(): ApiKeyCreds | null {
  const key = process.env.POLYMARKET_BUILDER_API_KEY
  const secret = process.env.POLYMARKET_BUILDER_API_SECRET
  const passphrase = process.env.POLYMARKET_BUILDER_API_PASSPHRASE
  if (!key || !secret || !passphrase) return null
  return { key, secret, passphrase }
}

function builderClient(creds: ApiKeyCreds): ClobClient {
  return new ClobClient({
    host: CLOB_URL,
    chain: Chain.POLYGON,
    creds,
    throwOnError: true,
  })
}

function mapTradeRow(r: Record<string, unknown>): BuilderTradeRow {
  return {
    id: String(r.id ?? ''),
    tradeType: String(r.tradeType ?? ''),
    takerOrderHash: String(r.takerOrderHash ?? ''),
    market: String(r.market ?? ''),
    assetId: String(r.assetId ?? ''),
    side: r.side === 'SELL' ? 'SELL' : 'BUY',
    outcome: String(r.outcome ?? ''),
    outcomeIndex: Number(r.outcomeIndex ?? 0),
    size: Number(r.size ?? 0),
    sizeUsdc: Number(r.sizeUsdc ?? 0),
    price: Number(r.price ?? 0),
    owner: String(r.owner ?? ''),
    maker: String(r.maker ?? ''),
    status: String(r.status ?? ''),
    fee: Number(r.fee ?? 0),
    feeUsdc: Number(r.feeUsdc ?? 0),
    transactionHash: String(r.transactionHash ?? ''),
    matchTime: String(r.matchTime ?? ''),
    bucketIndex: Number(r.bucketIndex ?? 0),
    builder: String(r.builder ?? ''),
    errMsg: typeof r.err_msg === 'string' ? r.err_msg : null,
    createdAt: typeof r.createdAt === 'string' ? r.createdAt : null,
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : null,
  }
}

/**
 * Fetch trades attribuiti al nostro builder code, paginato cursor-based.
 *
 * Doc Builder Methods → BuilderTradesPaginatedResponse:
 *  - trades: array (questa pagina)
 *  - next_cursor: passa al prossimo before/after per page following
 *  - limit: pageSize server-side
 *  - count: trade in QUESTA pagina (non grand total)
 *
 * Filtri opzionali per market/asset (focus su singolo evento).
 *
 * Ritorna `null` se le builder creds non sono configurate (env mancanti).
 */
export async function getBuilderTrades(params: {
  market?: string
  assetId?: string
  /** Cursor per paginazione: passa il `nextCursor` della risposta precedente. */
  before?: string
  after?: string
}): Promise<BuilderTradesPaginatedResponse | null> {
  if (!BUILDER_CODE) return null
  const creds = builderCreds()
  if (!creds) return null

  const sdkParams = {
    builder_code: BUILDER_CODE,
    ...(params.market && { market: params.market }),
    ...(params.assetId && { asset_id: params.assetId }),
    ...(params.before && { before: params.before }),
    ...(params.after && { after: params.after }),
  }

  try {
    const res = (await builderClient(creds).getBuilderTrades(sdkParams)) as unknown as {
      trades?: Array<Record<string, unknown>>
      next_cursor?: string
      limit?: number
      count?: number
    }
    const rows = res?.trades ?? []
    return {
      trades: rows.map(mapTradeRow),
      nextCursor: res.next_cursor ?? '',
      limit: Number(res.limit ?? rows.length),
      count: Number(res.count ?? rows.length),
    }
  } catch (err) {
    console.error('[builder.getBuilderTrades]', err)
    return null
  }
}

/**
 * Aggregate stats su un set di trades — calcolato client-side perché
 * Polymarket SDK non espone stats endpoint dedicato.
 *
 * Per stats globali (across pages), il caller accumula man mano che
 * pagina via cursor: pass tutti i trades unione delle pagine.
 */
export function aggregateBuilderStats(trades: BuilderTradeRow[]): BuilderStats {
  const traders = new Set<string>()
  const markets = new Set<string>()
  let volume = 0
  let fee = 0
  for (const t of trades) {
    traders.add(t.owner)
    markets.add(t.market)
    volume += t.sizeUsdc
    fee += t.feeUsdc
  }
  return {
    totalCount: trades.length,
    totalVolumeUsdc: volume,
    totalFeeUsdc: fee,
    uniqueTraders: traders.size,
    uniqueMarkets: markets.size,
  }
}
