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
}

export type ValidationError =
  | { code: 'MISSING_FIELD'; status: 400; message: string }
  | { code: 'INVALID_AMOUNT'; status: 400; message: string }
  | { code: 'INVALID_PRICE'; status: 400; message: string }
  | { code: 'REAL_NOT_SUPPORTED'; status: 501; message: string }

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
  // MA4.3 supporta SOLO demo (real submit verso Polymarket CLOB → MA4.4)
  if (!body.isDemo) {
    return {
      code: 'REAL_NOT_SUPPORTED',
      status: 501,
      message: 'Real mode arriverà in MA4.4 (Polymarket CLOB)',
    }
  }
  return null
}
