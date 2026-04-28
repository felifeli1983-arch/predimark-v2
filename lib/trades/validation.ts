/**
 * SignedOrder serializzato dal client (post createOrder via SDK).
 * Forma generica — il server lo passa raw a postSignedOrder().
 */
export type SignedOrderJson = Record<string, unknown>

export interface SubmitTradeBody {
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
  /** Token IDs del market — persistiti in markets.clob_token_ids per sell REAL. */
  clobTokenIds?: [string, string]
  /** REAL: ID del conditional token specifico (clobTokenIds[0] o [1] per side). */
  tokenId?: string
  /** REAL: order signed lato client via Privy. */
  signedOrder?: SignedOrderJson
}

export type ValidationError =
  | { code: 'MISSING_FIELD'; status: 400; message: string }
  | { code: 'INVALID_AMOUNT'; status: 400; message: string }
  | { code: 'INVALID_PRICE'; status: 400; message: string }
  | { code: 'REAL_FIELDS_MISSING'; status: 400; message: string }

/**
 * Valida il body POST /api/v1/trades/submit.
 * Ritorna `null` se valido, altrimenti l'errore strutturato.
 */
export function validateTradeBody(body: SubmitTradeBody): ValidationError | null {
  if (
    !body.polymarketMarketId ||
    !body.polymarketEventId ||
    !body.slug ||
    !body.title ||
    !body.cardKind ||
    !body.category ||
    !body.side
  ) {
    return { code: 'MISSING_FIELD', status: 400, message: 'Campi richiesti mancanti' }
  }
  if (!Number.isFinite(body.amountUsdc) || body.amountUsdc <= 0) {
    return { code: 'INVALID_AMOUNT', status: 400, message: 'amountUsdc deve essere > 0' }
  }
  if (!Number.isFinite(body.pricePerShare) || body.pricePerShare <= 0 || body.pricePerShare >= 1) {
    return {
      code: 'INVALID_PRICE',
      status: 400,
      message: 'pricePerShare deve essere strettamente tra 0 e 1',
    }
  }
  if (!body.isDemo) {
    if (!body.tokenId || !body.signedOrder) {
      return {
        code: 'REAL_FIELDS_MISSING',
        status: 400,
        message: 'tokenId + signedOrder richiesti per REAL trade',
      }
    }
  }
  return null
}
