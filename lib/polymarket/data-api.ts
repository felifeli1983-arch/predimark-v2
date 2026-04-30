/**
 * Wrapper per Polymarket Data API (`data-api.polymarket.com`) — endpoints
 * pubblici per holders / open interest / activity / user positions.
 *
 * Doc: https://docs.polymarket.com/market-data/overview
 *
 * NESSUNA auth richiesta — sono dati pubblici onchain. Cache lato Next
 * via `next.revalidate` quando chiamati server-side.
 */

const DATA_API_BASE = 'https://data-api.polymarket.com'

async function dataApiGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
  options?: { revalidate?: number; cache?: 'no-store' | 'force-cache' }
): Promise<T> {
  const url = new URL(path, DATA_API_BASE)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v))
    }
  }
  const init: RequestInit & { next?: { revalidate?: number } } = {}
  if (options?.cache) init.cache = options.cache
  else init.next = { revalidate: options?.revalidate ?? 30 }
  const res = await fetch(url.toString(), init)
  if (!res.ok) throw new Error(`Data API ${res.status}: ${res.statusText}`)
  return (await res.json()) as T
}

// ----------------------- HOLDERS -----------------------

export interface Holder {
  proxyWallet: string
  asset: string
  amount: number
  outcomeIndex: number
  /** Display name; può essere pseudo-anonimo (`Measly-Harbor`) o real. */
  name: string
  pseudonym: string
  bio: string
  profileImage: string
  verified: boolean
}

export interface HoldersByToken {
  token: string
  holders: Holder[]
}

/**
 * Top holders di un market, raggruppati per outcome token (Yes/No).
 * Ritorna 2 entries (1 per outcome), ognuna con array di holders ordinati
 * per `amount` desc.
 */
export async function fetchHolders(
  conditionId: string,
  limit: number = 10
): Promise<HoldersByToken[]> {
  const data = await dataApiGet<HoldersByToken[]>(
    '/holders',
    { market: conditionId, limit },
    { revalidate: 60 }
  )
  return Array.isArray(data) ? data : []
}

// ----------------------- OPEN INTEREST -----------------------

export interface OpenInterest {
  market: string
  /** Total dollar value of outstanding outcome tokens (USD). */
  value: number
}

/**
 * Open interest = pUSD totale lockato nei conditional tokens del market
 * (non ancora redento). Indicatore di liquidità reale e attività.
 */
export async function fetchOpenInterest(conditionId: string): Promise<number | null> {
  const data = await dataApiGet<OpenInterest[]>(
    '/oi',
    { market: conditionId },
    { revalidate: 60 }
  )
  if (!Array.isArray(data) || data.length === 0) return null
  return Number(data[0]!.value)
}

// ----------------------- USER POSITIONS / ACTIVITY -----------------------

export interface OnchainUserPosition {
  proxyWallet: string
  asset: string
  conditionId: string
  size: number
  /** Outcome index (0 = Yes, 1 = No). */
  outcomeIndex: number
  /** Avg entry price, decimal 0-1. */
  avgPrice: number
  /** Current market price. */
  curPrice: number
  /** Realized + unrealized profit. */
  cashPnl: number
  percentPnl: number
  totalBought: number
}

/**
 * Posizioni on-chain attive di un user (indipendente dal nostro DB).
 * Utile per: importare positions Polymarket-native dell'utente che si è
 * registrato in Auktora, audit cross-platform.
 */
export async function fetchUserPositions(
  userAddress: string
): Promise<OnchainUserPosition[]> {
  const data = await dataApiGet<OnchainUserPosition[]>(
    '/positions',
    { user: userAddress },
    { cache: 'no-store' }
  )
  return Array.isArray(data) ? data : []
}

export interface OnchainActivity {
  proxyWallet: string
  conditionId: string
  asset: string
  side: 'BUY' | 'SELL'
  outcomeIndex: number
  size: number
  price: number
  /** Tx hash. */
  transactionHash: string
  /** Unix timestamp ms. */
  timestamp: number
}

/**
 * Attività on-chain di un user (trade BUY/SELL across markets).
 * Per /me activity feed completo che cattura anche i trade fatti da
 * Polymarket native UI fuori da Auktora.
 */
export async function fetchUserActivity(
  userAddress: string,
  limit: number = 50
): Promise<OnchainActivity[]> {
  const data = await dataApiGet<OnchainActivity[]>(
    '/activity',
    { user: userAddress, limit },
    { cache: 'no-store' }
  )
  return Array.isArray(data) ? data : []
}
