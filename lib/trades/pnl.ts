/**
 * Calcoli P&L puri (no I/O). Usati lato server (sell endpoint) e
 * lato client (preview prima della conferma sell).
 */

export interface PnLResult {
  /** USDC totale ricevuto dalla vendita (shares × price) */
  totalReceived: number
  /** P&L assoluto (totalReceived - costo originale di quelle shares) */
  pnl: number
  /** P&L percentuale rispetto al costo */
  pnlPct: number
  /** Vincita? (pnl > 0) */
  isWin: boolean
}

/**
 * Calcola il risultato di una sell parziale o totale.
 *
 * @param avgPrice — prezzo medio di carico (avg_price della position)
 * @param currentPrice — prezzo corrente (snapshot al momento della sell)
 * @param sharesSold — quante shares stiamo vendendo (≤ position.shares)
 */
export function computeSellPnL(
  avgPrice: number,
  currentPrice: number,
  sharesSold: number
): PnLResult {
  const totalReceived = sharesSold * currentPrice
  const totalCost = sharesSold * avgPrice
  const pnl = totalReceived - totalCost
  const pnlPct = avgPrice > 0 ? (currentPrice / avgPrice - 1) * 100 : 0
  return {
    totalReceived,
    pnl,
    pnlPct,
    isWin: pnl > 0,
  }
}

/**
 * Calcola il valore corrente di una position aperta:
 * `current_value = shares × current_price`. Usato per `/me/positions`.
 */
export function computeCurrentValue(shares: number, currentPrice: number): number {
  return shares * currentPrice
}

/**
 * Calcola unrealized P&L per una position aperta.
 * (Non chiusa, è solo proiezione "se chiudessi ora").
 */
export function computeUnrealizedPnL(
  avgPrice: number,
  currentPrice: number,
  shares: number
): { pnl: number; pnlPct: number } {
  const cost = shares * avgPrice
  const value = shares * currentPrice
  const pnl = value - cost
  const pnlPct = avgPrice > 0 ? (currentPrice / avgPrice - 1) * 100 : 0
  return { pnl, pnlPct }
}
