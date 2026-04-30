/**
 * Reference price ("prezzo da battere") per crypto round Polymarket.
 *
 * Per ogni round Up/Down, la resolution rule dice:
 *   "resolves to Up if price at end ≥ price at beginning of time range"
 *
 * Il "price at beginning" è il valore Chainlink/Binance al `startDate`
 * del round. Polymarket Gamma NON espone direttamente questo campo,
 * quindi lo fetchiamo dalla candle 1m Binance al timestamp giusto.
 *
 * Cache in-memory module-level — il reference price di un round non
 * cambia mai (è snapshot fisso al startDate), quindi 1 fetch per round.
 */

const cache = new Map<string, number>()

const BINANCE_API = 'https://api.binance.com/api/v3/klines'

/**
 * Fetch reference price (close della candle 1m al `startDate` del round).
 * Cache deduplicata per `${symbol}|${startMs}`. Ritorna null su errore.
 */
export async function fetchReferencePrice(
  symbol: string,
  startDate: Date | string
): Promise<number | null> {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const startMs = start.getTime()
  if (!Number.isFinite(startMs)) return null

  const sym = symbol.toUpperCase()
  const cacheKey = `${sym}|${startMs}`
  const cached = cache.get(cacheKey)
  if (cached !== undefined) return cached

  try {
    const url = new URL(BINANCE_API)
    url.searchParams.set('symbol', sym)
    url.searchParams.set('interval', '1m')
    url.searchParams.set('startTime', String(startMs))
    url.searchParams.set('limit', '1')
    const res = await fetch(url.toString(), { cache: 'force-cache' })
    if (!res.ok) return null
    const data = (await res.json()) as Array<
      [number, string, string, string, string, ...unknown[]]
    >
    const first = data[0]
    if (!Array.isArray(data) || !first) return null
    // Kline format: [openTime, o, h, l, c, ...]. Usiamo close (index 4)
    // come reference — corrisponde al prezzo "fissato" alla fine del minuto
    // di apertura del round, allineato con come Chainlink snapshotta.
    const close = parseFloat(first[4])
    if (!Number.isFinite(close)) return null
    cache.set(cacheKey, close)
    return close
  } catch {
    return null
  }
}
